// The library's public API surface. `npm run check-catalog` and
// `npm run check-taxonomy` both read this barrel, so an export added here
// without a catalog fixture — or filed in a group the catalog never declared —
// fails the build.
//
// Grouped by layer, matching the catalog's rail.
//
//   layer 1  BrandKit    the theming — the mark lives here
//   layer 2  Foundation  the commoditised UI we ADOPT rather than build
//   layer 3  Components  the organisms — the only layer we design
//   layer 3  Screens     those organisms arranged into pages
//
// The layer-2 test is provenance, not appearance: if we authored it, it is
// layer 3 however primitive it looks. See `apps/catalog/src/fixtures.js`
// ("navigation structure") for the full reasoning.

// ── layer 1 · BrandKit ──────────────────────────────────────────────────────
export { default as KhaosLogo } from './KhaosLogo.svelte'

// ── layer 2 · Foundation ────────────────────────────────────────────────────
// Adopted (Ark UI) primitives — the ARIA pattern, focus management and keyboard
// behaviour come from the primitive; only the tokens are ours (D39, D50, P3).
export { default as ConfirmDialog } from './ConfirmDialog.svelte'
export { default as EditableField } from './EditableField.svelte'
export { default as Menu } from './Menu.svelte'
export { default as SegmentedControl } from './SegmentedControl.svelte'
export { default as Toggle } from './Toggle.svelte'

// Icons — Phosphor, adopted the same way. Ours is a 13-line wrapper.
export { default as Icon } from './Icon.svelte'

// ── layer 3 · Components ────────────────────────────────────────────────────
// Everything below we authored. The first four groups are building blocks —
// what the thing DOES; the rest are composed surfaces — what SHAPE it is.

// Labels — name or annotate a value.
export { default as LabeledField } from './LabeledField.svelte'
export { default as LabeledPill } from './LabeledPill.svelte'
export { default as MetaStrip } from './MetaStrip.svelte'
export { default as ProviderBadge } from './ProviderBadge.svelte'
export { default as ProviderMark } from './ProviderMark.svelte'
export { default as SectionHeader } from './SectionHeader.svelte'
export { default as StatusPill } from './StatusPill.svelte'

// Fields — take input. EditableField used to be here and is now on the adopted
// shelf above: rebuilding it on Ark's Editable moved it a tier, which is the
// layer-2 test working rather than an exception to it.
export { default as Button } from './Button.svelte'
export { default as FilterField } from './FilterField.svelte'
export { default as SpeakerPicker } from './SpeakerPicker.svelte'
export { default as LanguagePicker } from './LanguagePicker.svelte'
export { default as SpeechControls } from './SpeechControls.svelte'

// Media — imagery and audio. Portrait documents the placeholder precedence.
export { default as AudioPlayback } from './AudioPlayback.svelte'
export { default as Waveform } from './Waveform.svelte'
export { default as Gallery } from './Gallery.svelte'
export { default as Portrait } from './Portrait.svelte'

// Feedback — what a surface says instead of content, or after an action.
export { default as EmptyState } from './EmptyState.svelte'
export { default as InstallList } from './InstallList.svelte'
export { default as InstallScript } from './InstallScript.svelte'
export { default as OutcomeBanner } from './OutcomeBanner.svelte'
export { default as SetupProgress } from './SetupProgress.svelte'

// Cards — a bounded summary of one thing. Props-driven, D52-compliant.
export { default as MetricCard } from './MetricCard.svelte'
export { default as ProjectCard } from './ProjectCard.svelte'

// Rows — one entity as a list line. SelectableRow is the base the four lists
// share; the other two wrap it. Split from `lists` because a row and a
// collection are different call sites.
export { default as SelectableRow } from './SelectableRow.svelte'

// Lists — a collection of entities.
export { default as ServiceStatusList } from './ServiceStatusList.svelte'
export { default as TakeList } from './TakeList.svelte'

// Composition — the interpreter for a composed document.
//
// A composed component is JSON, and JSON nobody can interpret is not publishable
// in any useful sense: an app that installs the kit needs something that turns
// `components/composed/*.json` into pixels. ONE export, deliberately — the kit
// still ships no Stack, Grid or Spacer, because layout lives in the document as
// metadata rather than as components to import.
//
// Its styles ship separately, in `lib/compose.css`, the way `.eyebrow` does:
// import it alongside tokens.css or a composed page renders as an unstyled
// column.
export { default as Composed } from './Composed.svelte'

// Desktop shell — the data layer's window chrome (data-layer plan, Phase K; audit §4.1).
// The layout is data the host saves; every interactive element takes a `data-ui-id`.
export { default as Dock } from './Dock.svelte'
export { default as SourceList } from './SourceList.svelte'
export { default as WorkspaceSwitcher } from './WorkspaceSwitcher.svelte'
export { default as Toolbar } from './Toolbar.svelte'
export { default as DataTable } from './DataTable.svelte'
export { default as PropertyRow } from './PropertyRow.svelte'
export { default as InspectorSection } from './InspectorSection.svelte'
export { default as RenderMark } from './RenderMark.svelte'
export { default as TokenField } from './TokenField.svelte'
export { default as ScreenplayText } from './ScreenplayText.svelte'
export { default as ScreenplayEditor } from './ScreenplayEditor.svelte'
export { default as ScrubNumber } from './ScrubNumber.svelte'
export { default as CommandPalette } from './CommandPalette.svelte'
export { default as StatusBar } from './StatusBar.svelte'
export { default as Popover } from './Popover.svelte'
export { default as Sheet } from './Sheet.svelte'
export { default as RenderStrip } from './RenderStrip.svelte'
export { default as EventLog } from './EventLog.svelte'
export { default as Checkbox } from './Checkbox.svelte'
export { default as RadioChoiceList } from './RadioChoiceList.svelte'
export { default as EngineDetails } from './EngineDetails.svelte'
export { default as WelcomeWindow } from './WelcomeWindow.svelte'

// Charts — data visualisations. A chart is a complex component built out of
// basic UI blocks, and the information it chooses to show is exactly where this
// product differentiates. They compose nothing, which is what used to scatter
// two of them onto the Foundation shelf; composing nothing is not what makes
// something foundational.
export { default as BarChart } from './BarChart.svelte'
export { default as MeasureTable } from './MeasureTable.svelte'

// Inspectors — props-driven surfaces composed of the elements above.
export { default as VoiceClonePanel } from './VoiceClonePanel.svelte'
export { default as VoiceDesignPanel } from './VoiceDesignPanel.svelte'
export { default as DialogueComposer } from './DialogueComposer.svelte'

// ── layer 3 · Screens ───────────────────────────────────────────────────────
// The organisms above, arranged into pages.
export { default as CharacterAppearanceWorkbench } from './CharacterAppearanceWorkbench.svelte'
export { default as ResourceCatalog } from './ResourceCatalog.svelte'
export { default as Settings } from './Settings.svelte'
export { default as StoryPlayer } from './StoryPlayer.svelte'
export { default as StoryOverview } from './StoryOverview.svelte'
export { default as StoryOverviewOutline } from './StoryOverviewOutline.svelte'
export { default as StoryOverviewSide } from './StoryOverviewSide.svelte'
export { default as StoryOverviewStrip } from './StoryOverviewStrip.svelte'
export { default as ReadingReadiness } from './ReadingReadiness.svelte'
export { default as SoundStudio } from './SoundStudio.svelte'
export { default as VoicePresetPanel } from './VoicePresetPanel.svelte'
export { default as VoiceStudio } from './VoiceStudio.svelte'

export { default as SceneReadStatus } from './SceneReadStatus.svelte'

export { default as StoryAtlasToolbar } from './StoryAtlasToolbar.svelte'
export { default as StoryAtlasRelationship } from './StoryAtlasRelationship.svelte'

export { default as ShotInspector } from './ShotInspector.svelte'

export { default as SceneShotPlanner } from './SceneShotPlanner.svelte'
export { default as ShotPreview } from './ShotPreview.svelte'

export { default as VoiceDesignTraits } from './VoiceDesignTraits.svelte'

export { default as PlaceAppearanceWorkbench } from './PlaceAppearanceWorkbench.svelte'
export { default as ObjectAppearanceWorkbench } from './ObjectAppearanceWorkbench.svelte'
export { default as ComposerExportDialog } from './ComposerExportDialog.svelte'
export { default as PictureTimingReview } from './PictureTimingReview.svelte';

// Khaos App's shared panes (catalog app-coverage plan, T1): the presentational half
// of views the app binds to its models.
export { default as AnalysisStale } from './AnalysisStale.svelte'
export { default as FinishSetupConfirm } from './FinishSetupConfirm.svelte'
export { default as GenerationFailureDetails } from './GenerationFailureDetails.svelte'
export { default as ImageThumb } from './ImageThumb.svelte'
export { default as PlaybackEventInspector } from './PlaybackEventInspector.svelte'
export { default as ProviderDisclosure } from './ProviderDisclosure.svelte'
export { default as QuitPrompt } from './QuitPrompt.svelte'
export { default as RefusalOffer } from './RefusalOffer.svelte'
export { default as SubjectImages } from './SubjectImages.svelte'
export { default as DialogueInspector } from './DialogueInspector.svelte'
export { default as IdentitySide } from './IdentitySide.svelte'
export { default as LineInspector } from './LineInspector.svelte'
export { default as ReadTimeline } from './ReadTimeline.svelte'
export { default as SceneReads } from './SceneReads.svelte'

// Khaos App's Characters panes (catalog app-coverage plan, T2).
export { default as CharacterAliases } from './CharacterAliases.svelte'
export { default as CharacterAnalysis } from './CharacterAnalysis.svelte'
export { default as CharacterDetail } from './CharacterDetail.svelte'
export { default as CharacterMentions } from './CharacterMentions.svelte'
export { default as CharacterRecordings } from './CharacterRecordings.svelte'
export { default as CharacterSide } from './CharacterSide.svelte'
export { default as CharacterTable } from './CharacterTable.svelte'

// Khaos App's Scenes panes (catalog app-coverage plan, T3).
export { default as SceneAnalysis } from './SceneAnalysis.svelte'
export { default as SceneDetail } from './SceneDetail.svelte'
export { default as SceneSide } from './SceneSide.svelte'
export { default as SceneTable } from './SceneTable.svelte'

// Khaos App's Places and Objects panes (catalog app-coverage plan, T4).
export { default as LocationHeadings } from './LocationHeadings.svelte'
export { default as ObjectDetail } from './ObjectDetail.svelte'
export { default as ObjectSide } from './ObjectSide.svelte'
export { default as ObjectTable } from './ObjectTable.svelte'
export { default as PlaceAnalysis } from './PlaceAnalysis.svelte'
export { default as PlaceAreas } from './PlaceAreas.svelte'
export { default as PlaceDetail } from './PlaceDetail.svelte'
export { default as PlaceSide } from './PlaceSide.svelte'
export { default as PlaceTable } from './PlaceTable.svelte'
// The place review's plan and 3D viewer (place-build plan V-U). PlaceViewer loads three.js by
// dynamic import, so the barrel stays free of it.
export { default as PlacePlan } from './PlacePlan.svelte'
export { default as PlaceViewer } from './PlaceViewer.svelte'
// Khaos App's place review screen, composing both (place-build plan V-A).
export { default as PlaceReview } from './PlaceReview.svelte'
// A Place Build's rounds as they land, and the selected round's views (khaos-app#587).
export { default as PlaceBuildRounds } from './PlaceBuildRounds.svelte'
// A place's Structure step: size, building, areas, then the plan's review (khaos-app#589).
export { default as PlaceStructure } from './PlaceStructure.svelte'
export { default as SubjectDesign } from './SubjectDesign.svelte'

// Khaos App's Images and Audio panes (catalog app-coverage plan, T5).
export { default as AudioDetail } from './AudioDetail.svelte'
export { default as AudioSide } from './AudioSide.svelte'
export { default as AudioTable } from './AudioTable.svelte'
export { default as ImageDetail } from './ImageDetail.svelte'
export { default as ImageSide } from './ImageSide.svelte'
export { default as ImageTable } from './ImageTable.svelte'
export { default as RefusedTakes } from './RefusedTakes.svelte'

// Khaos App's Review panes (catalog app-coverage plan, T6).
export { default as ExtractionReview } from './ExtractionReview.svelte'
export { default as ReviewOccurrences } from './ReviewOccurrences.svelte'
export { default as ReviewQueue } from './ReviewQueue.svelte'
export { default as ReviewSide } from './ReviewSide.svelte'
export { default as ReviewSuggestions } from './ReviewSuggestions.svelte'

// Khaos App's player panes (catalog app-coverage plan, T7). StoryAtlas is not here: it loads
// Pixi, so it has its own entry, story-atlas.js.
export { default as Composer } from './Composer.svelte'
// The Composer's 3D previs of a shot (shot-kit plan B-U1a). It loads three.js by dynamic import,
// so the barrel stays free of it (D94).
export { default as ShotPrevis } from './ShotPrevis.svelte'
// The shot's plan: figures as pucks, props as footprints, the camera's cone (shot-kit plan B-U1b).
export { default as ShotPlan } from './ShotPlan.svelte'
export { default as Player } from './Player.svelte'
export { default as StoryPlayback } from './StoryPlayback.svelte'

// Khaos App's windows (catalog app-coverage plan, T9).
export { default as Activity } from './Activity.svelte'
export { default as BudgetPane } from './BudgetPane.svelte'
export { default as ModelsPane } from './ModelsPane.svelte'
export { default as ProblemReport } from './ProblemReport.svelte'
export { default as ProjectHistory } from './ProjectHistory.svelte'
export { default as Resources } from './Resources.svelte'
export { default as Splash } from './Splash.svelte'
export { default as VoiceRow } from './VoiceRow.svelte'
export { default as ProviderSetup } from './ProviderSetup.svelte'
export { default as SetupConnect } from './SetupConnect.svelte'
export { default as Setup } from './Setup.svelte'
export { default as SettingsWindow } from './SettingsWindow.svelte'
export { default as ProjectSettings } from './ProjectSettings.svelte'
export { default as Voices } from './Voices.svelte'
export { default as VoiceBrief } from './VoiceBrief.svelte'
export { default as ProjectWindow } from './ProjectWindow.svelte'
export { default as LauncherWindow } from './LauncherWindow.svelte'
export { default as StaleSheet } from './StaleSheet.svelte'
export { default as ProjectStatusHUD } from './ProjectStatusHUD.svelte'
export { default as Shell } from './Shell.svelte'
