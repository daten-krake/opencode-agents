from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import unittest
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "skills" / "detection-test" / "scripts" / "test-detection-rules.py"
SPEC = importlib.util.spec_from_file_location("detection_test_runner", MODULE_PATH)
assert SPEC is not None and SPEC.loader is not None
RUNNER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(RUNNER)


class DetectionTestRunnerTests(unittest.TestCase):
    def test_graph_token_prefers_runner_injected_environment(self) -> None:
        response = mock.MagicMock()
        response.__enter__.return_value.read.return_value = b'{"access_token":"test-token"}'
        environment = {
            "MS_GRAPH_TENANT_ID": "test-tenant",
            "MS_GRAPH_CLIENT_ID": "test-client",
            "MS_GRAPH_CLIENT_SECRET": "test-secret",
        }

        with (
            mock.patch.dict(os.environ, environment, clear=False),
            mock.patch.object(RUNNER, "load_env_file") as load_env_file,
            mock.patch.object(RUNNER.urllib.request, "urlopen", return_value=response),
        ):
            self.assertEqual(RUNNER.graph_token(), "test-token")

        load_env_file.assert_not_called()

    def test_build_harness_appends_exact_count(self) -> None:
        rule = {"query": "Source | where Value == 'bad';"}
        block = {
            "testdata": "let Source = datatable(Value:string) ['bad'];",
            "expected": 1,
        }

        harness, error = RUNNER.build_harness(rule, block)

        self.assertIsNone(error)
        self.assertIsNotNone(harness)
        assert harness is not None
        self.assertTrue(harness.endswith("\n| count"))
        self.assertNotIn(";'\n| count", harness)

    def test_build_harness_concatenates_testdata_list(self) -> None:
        rule = {"query": "One | join kind=inner Two on Key"}
        block = {
            "testdata": [
                "let One = datatable(Key:string) ['x'];",
                "let Two = datatable(Key:string) ['x'];",
            ],
            "expected": 1,
        }

        harness, error = RUNNER.build_harness(rule, block)

        self.assertIsNone(error)
        assert harness is not None
        self.assertIn(";\n\nlet Two", harness)
        self.assertTrue(harness.endswith("| count"))

    def test_recognizes_known_sentinel_xdr_incompatibility(self) -> None:
        body = '{"error":{"message":"Failed to resolve scalar expression named _GetWatchlist"}}'
        error = RUNNER.QueryHTTPError(400, body)

        self.assertTrue(RUNNER.is_xdr_incompatibility_error(error))

    def test_does_not_downgrade_ordinary_syntax_error(self) -> None:
        body = '{"error":{"message":"Syntax error near where"}}'
        error = RUNNER.QueryHTTPError(400, body)

        self.assertFalse(RUNNER.is_xdr_incompatibility_error(error))

    def test_duration_comparison_rejects_frequency_larger_than_period(self) -> None:
        errors = RUNNER.validate_rule(
            {
                "engine": "defender_xdr",
                "query": "Source",
                "query_frequency": "P1D",
                "query_period": "PT1H",
                "testblock": [
                    {
                        "testdata": "let Source = datatable(X:string) [];",
                        "expected": 0,
                    }
                ],
            }
        )

        self.assertIn("query_frequency must not exceed query_period", errors)

    def test_testblock_must_define_declared_data_sources(self) -> None:
        errors = RUNNER.validate_rule(
            {
                "engine": "defender_xdr",
                "data_sources": ["Source", "Lookup"],
                "query": "Source | join Lookup on Key",
                "testblock": [
                    {
                        "testdata": "let Source = datatable(Key:string) [];",
                        "expected": 0,
                    }
                ],
            }
        )

        self.assertIn("testblock[0] must define data source Lookup", errors)

    def test_exclusion_contract_requires_all_arrays(self) -> None:
        errors = RUNNER.validate_rule(
            {
                "engine": "defender_xdr",
                "query": "let exclusion_IP = dynamic([]); Source",
                "exclusions": [],
                "testblock": [
                    {
                        "testdata": "let Source = datatable(X:string) [];",
                        "expected": 0,
                    }
                ],
            }
        )

        self.assertIn("query must declare exclusion_Account", errors)

    def test_exclusion_contract_requires_guard_for_mapped_entity(self) -> None:
        declarations = "\n".join(
            f"let exclusion_{entity} = dynamic([]);"
            for entity in RUNNER.EXCLUSION_ENTITY_TYPES
        )
        errors = RUNNER.validate_rule(
            {
                "engine": "defender_xdr",
                "data_sources": ["Source"],
                "query": f"{declarations}\nSource | project DeviceName",
                "entity_mapping": [{"entity_type": "Host", "field_mapping": []}],
                "exclusions": [],
                "testblock": [
                    {
                        "testdata": "let Source = datatable(DeviceName:string) [];",
                        "expected": 0,
                    }
                ],
            }
        )

        self.assertIn("query must apply exclusion_Host for mapped entity Host", errors)

    def test_data_sources_is_required(self) -> None:
        errors = RUNNER.validate_rule(
            {
                "engine": "defender_xdr",
                "query": "Source",
                "testblock": [
                    {
                        "testdata": "let Source = datatable(X:string) [];",
                        "expected": 0,
                    }
                ],
            }
        )

        self.assertIn("data_sources must be a non-empty list of table names", errors)

    def test_rule_schema_requires_integer_expected(self) -> None:
        errors = RUNNER.validate_rule(
            {
                "engine": "defender_xdr",
                "query": "Source",
                "testblock": [{"testdata": "let Source = datatable(X:string) [];", "expected": "1"}],
            }
        )

        self.assertIn("testblock[0].expected must be an integer", errors)


if __name__ == "__main__":
    unittest.main()
