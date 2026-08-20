from __future__ import annotations

import importlib.util
from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts" / "validate-detection-factory.py"
SPEC = importlib.util.spec_from_file_location("validate_detection_factory", MODULE_PATH)
assert SPEC and SPEC.loader
factory = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(factory)


class DetectionFactoryTests(unittest.TestCase):
    def test_factory_static_validation_passes(self) -> None:
        self.assertEqual(factory.validate(check_links=False), [])

    def test_profiles_use_one_reviewer_and_explicit_profile(self) -> None:
        for profile, spec in factory.PROFILE_MAPS.items():
            role_map = factory.first_yaml_block(spec["path"])
            self.assertEqual(role_map["profile"], profile)
            self.assertIn("reviewer", role_map)
            self.assertIn("metadata_reviewer", role_map)
            self.assertNotIn("reviewer_auto", role_map)
            self.assertNotIn("reviewer_gated", role_map)

    def test_stage_inputs_are_immediate_predecessors(self) -> None:
        for agent, contract in factory.HANDOFF_INPUTS.items():
            prompt = factory.text(ROOT / "agents" / agent / f"{agent}.md")
            self.assertIn(f"`{contract}`", prompt)
            self.assertRegex(prompt, rf"Consume\s+exactly\s+one\s+`{re.escape(contract)}`")
        for planner in ("detection-planner", "detection-planner-local"):
            prompt = factory.text(ROOT / "agents" / planner / f"{planner}.md")
            self.assertIn("exactly one `ScoutContract`", prompt)
            self.assertIn("exactly one `PlanRevisionContract`", prompt)

    def test_reviewers_cannot_invoke_implementers(self) -> None:
        for reviewer in factory.REVIEWERS:
            config = factory.frontmatter(ROOT / "agents" / reviewer / f"{reviewer}.md")
            self.assertEqual(config["permission"]["task"], "deny")

    def test_implementation_and_review_use_runner_without_bash(self) -> None:
        for worker in factory.RUNNER_AGENTS:
            config = factory.frontmatter(ROOT / "agents" / worker / f"{worker}.md")
            self.assertEqual(config["permission"]["bash"], "deny")
            self.assertEqual(config["permission"]["detection-factory-runner"], "allow")
            self.assertEqual(config["permission"]["defender-xdr-hunt"], "deny")
            self.assertEqual(config["permission"]["todowrite"], "deny")

    def test_all_roles_are_non_interactive_at_filesystem_boundary(self) -> None:
        for agent in factory.AGENTS:
            config = factory.frontmatter(ROOT / "agents" / agent / f"{agent}.md")
            self.assertEqual(config["permission"]["external_directory"], "deny")

    def test_readable_roles_deny_sensitive_files(self) -> None:
        for agent in factory.AGENTS:
            config = factory.frontmatter(ROOT / "agents" / agent / f"{agent}.md")
            read_permission = config["permission"]["read"]
            if read_permission == "deny":
                continue
            self.assertEqual(read_permission["*"], "allow")
            for pattern in ("**/.git/**", "**/.env", "**/.env.*"):
                self.assertEqual(read_permission[pattern], "deny")

    def test_implementers_can_update_only_supported_rule_formats_and_steward_state(self) -> None:
        for agent in ("detection-implementer", "detection-implementer-local"):
            config = factory.frontmatter(ROOT / "agents" / agent / f"{agent}.md")
            edit = config["permission"]["edit"]
            self.assertEqual(edit["*"], "deny")
            self.assertEqual(edit["**/.steward-state.json"], "allow")

    def test_default_mode_and_query_budget_are_bounded(self) -> None:
        core = factory.text(ROOT / "skills" / "detection-factory-core" / "SKILL.md")
        hunt = factory.text(ROOT / "tools" / "defender-xdr-hunt.ts")
        self.assertIn("Default mode is `auto`", core)
        self.assertIn("`--gated`", core)
        self.assertIn("max_repair_passes: 1", core)
        self.assertIn("WARN_VALIDATION_UNAVAILABLE", core)
        self.assertIn("FACTORY_PLANNER_QUERY_LIMIT = 8", hunt)

    def test_metadata_fast_path_is_compact_and_independently_reviewed(self) -> None:
        metadata = factory.text(ROOT / "skills" / "detection-factory-metadata" / "SKILL.md")
        state = factory.text(ROOT / "tools" / "detection-factory-state.ts")
        runner = factory.text(ROOT / "tools" / "detection-factory-runner.ts")
        self.assertIn("pre-mutation eligibility failure", metadata)
        self.assertIn("zero questions, permission waits, repairs, and full-pipeline", metadata)
        self.assertIn("probe_metadata", state)
        self.assertIn("prepare_metadata", state)
        self.assertIn("inspect_metadata_diff", runner)
        for reviewer in ("detection-metadata-reviewer", "detection-metadata-reviewer-local"):
            config = factory.frontmatter(ROOT / "agents" / reviewer / f"{reviewer}.md")
            self.assertEqual(config["steps"], 4)
            self.assertEqual(config["permission"]["read"], "deny")
            self.assertEqual(config["permission"]["skill"], "deny")
            self.assertEqual(config["permission"]["detection-factory-runner"], "allow")

    def test_controllers_use_checkpoints_instead_of_todo_turns(self) -> None:
        for controller in factory.CONTROLLER_TASKS:
            config = factory.frontmatter(ROOT / "agents" / controller / f"{controller}.md")
            self.assertEqual(config["permission"]["todowrite"], "deny")

    def test_repair_and_review_handoffs_are_self_contained(self) -> None:
        core = factory.text(ROOT / "skills" / "detection-factory-core" / "SKILL.md")
        review = factory.text(ROOT / "skills" / "detection-review" / "SKILL.md")
        for field in ("authoritative_sources", "validation_commands", "repair_history", "publication"):
            self.assertIn(field, core)
            self.assertIn(field, review)
        for field in ("exact_checks", "test_results", "xdr_evidence", "remaining_risks", "stage_models"):
            self.assertIn(f"  {field}:", review)
        self.assertNotIn("\nremaining_risks: []", review)
        self.assertIn('parent_handoff_id: "<run_id>:implementation-handoff-<pass>"', review)
        self.assertIn("invoke a fresh reviewer session", core)

    def test_approved_plan_preserves_intent_and_publication(self) -> None:
        core = factory.text(ROOT / "skills" / "detection-factory-core" / "SKILL.md")
        self.assertIn("the controller carries `intent`", core)
        self.assertIn("assembles `publication` once", core)
        self.assertNotIn("preserve_review_basis", core)

    def test_performance_baseline_is_preserved(self) -> None:
        stats = factory.text(ROOT / "DETECTION_FACTORY_STATS.md")
        self.assertIn("ses_031fa9a16ffeotShhSqp35Dt7Z", stats)
        self.assertIn("11h 20m 46s", stats)
        self.assertIn("5,910,030", stats)
        self.assertIn("Planner Defender XDR calls | 51", stats)


if __name__ == "__main__":
    unittest.main()
