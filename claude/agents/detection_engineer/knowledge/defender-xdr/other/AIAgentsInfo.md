# AIAgentsInfo

Source: [https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-aiagentsinfo-table](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-aiagentsinfo-table)

## Description
The `AIAgentsInfo` table in the advanced hunting schema contains information about AI agents and their associated entities. Use this reference to construct queries that return information from this table.

Microsoft Defender populates this table through connectors in Microsoft Defender for Cloud Apps Power Plaform and Microsoft Agent 365. If your organization doesn't deploy these services, queries that use the table don't work or return any results.

## Columns

| Column Name | Type | Description |
|---|---|---|
| Timestamp | datetime | Last date and time recorded for the agent info |
| RegistrySource | string | Registry that provided the agent's metadata |
| AIAgentId | guid | Unique identifier for the agent as assigned to it in Microsoft 365 Copilot or Copilot Studio |
| AIAgentName | string | Display name of the agent |
| AgentCreationTime | datetime | Date and time when the agent was created |
| CreatorAccountUpn | string | User principal name (UPN) of the account that created the agent |
| OwnerAccountUpns | string | User principal names (UPN) of all the owners of the agent |
| LastModifiedByUpn | string | User principal name (UPN) of the account that last modified that agent |
| LastModifiedTime | datetime | Date and time when the agent was last modified |
| LastPublishedTime | datetime | Date and time when the agent was last published |
| LastPublishedByUpn | string | User principal name (UPN) of the account that last published the agent |
| AgentDescription | string | Description of the agent as displayed in the agent's source |
| AgentStatus | string | Status of the agent; possible values: Created, Published, Deleted |
| UserAuthenticationType | string | The agent's configured authentication type for users interacting with the agent; possible values: None, Microsoft, Custom |
| AgentUsers | string | List of user principal names (UPNs) or group IDs that can use the agent |
| KnowledgeDetails | string | Details about the knowledge sources added to the agent |
| AgentActionTriggers | string | List of triggers that makes an autonomous agent take action |
| RawAgentInfo | string | Contents of the raw JSON that describes the agent and contains configuration details, as received from the provider |
| AuthenticationTrigger | string | Indicates when authentication is triggered for the agent; possible values: As Needed, Always |
| AccessControlPolicy | string | Users that can interact with the agent; possible values: Any, Copilot readers, Group membership, Any (multitenant) |
| AuthorizedSecurityGroupIds | dynamic | List of Azure Active Directory Group IDs that are allowed to interact with the agent |
| AgentTopicsDetails | dynamic | Specifications of the topics that the agent can perform |
| AgentToolsDetails | dynamic | Specifications of the tools that the agent can access and perform actions on |
| EnvironmentId | string | The identifier of the Microsoft Power Platform environment the agent resides in |
| Platform | string | The platform that provided the information about the agents; possible values: Copilot Studio |
| IsGenerativeOrchestrationEnabled | boolean | Indicates whether the agent uses generative orchestration (that is, dynamically chooses tools, knowledge, and actions based on context) to operate |
| AgentAppId | string | The unique app identifier registered for the agent in Microsoft Entra |
| ConnectedAgentsSchemaNames | dynamic | Lists the schema names of connected agents, which are independently managed agents that are linked to the main one for orchestration |
| ChildAgentsSchemaNames | dynamic | Lists the schema names of the child agents that exist within the main agent |
| Version | string | Version of the agent |
| IsBlocked | boolean | Indicates whether the agent has been blocked by an administrator |
| Instructions | string | The agent's system prompt that defines its default behavior, persona, and operating boundaries |
| EntraObjectId | string | The agent's unique enterprise application object identifier by Microsoft Entra ID |
| EntraBlueprintId | string | The agent's identity blueprint principal identifier by Microsoft Entra Agent ID |
| AIModel | string | The AI model powering the agent |
| AccessCapabilities | dynamic | Data access capabilities granted to the agent |
| ElementTypes | dynamic | Technical component types that make up the agent |
| SourceAgentId | string | The platform-native identifier of the agent, such as the Azure Resource Manager (ARM) identifier for Microsoft Foundry agents or the environment-scoped agent identifier for Copilot Studio agents |

## Action Types (if applicable)

No ActionType values are defined for this table.
