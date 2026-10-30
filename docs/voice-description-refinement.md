# Optional voice-description refinement

`VoiceStudio` accepts an optional `onRefineDescription(description, signal)` callback returning `{description, notes}`. The host owns character context, text generation, validation and error details. The component never builds a prompt or calls a provider.

With a hosted design selected, the callback enables refinement, proposal review, regeneration and explicit use/dismiss actions. The current description stays editable during preparation. A proposal cannot overwrite it without acceptance. Voice creation waits while preparation or proposal review is pending; manual creation is unchanged when refinement is unused. Applying a proposal resets charge consent. Component destruction aborts the callback signal, and late results are ignored.

Text preparation remains available while an earlier hosted operation needs reconciliation, but existing candidate-creation and acceptance blocks remain in force. The callback is absent for ordinary manual studio use and is not used for human replication.
