import ScreenplayEditor from '@khaos-machine/khaotik-ui/components/svelte/ScreenplayEditor.svelte'
import PictureTimingReview from '@khaos-machine/khaotik-ui/components/svelte/PictureTimingReview.svelte'
import ComposerExportDialog from '@khaos-machine/khaotik-ui/components/svelte/ComposerExportDialog.svelte'
import ObjectAppearanceWorkbench from '@khaos-machine/khaotik-ui/components/svelte/ObjectAppearanceWorkbench.svelte'
import PlaceAppearanceWorkbench from '@khaos-machine/khaotik-ui/components/svelte/PlaceAppearanceWorkbench.svelte'
import CharacterAppearanceWorkbench from '@khaos-machine/khaotik-ui/components/svelte/CharacterAppearanceWorkbench.svelte'
import VoiceDesignTraits from '@khaos-machine/khaotik-ui/components/svelte/VoiceDesignTraits.svelte'
import SceneShotPlanner from '@khaos-machine/khaotik-ui/components/svelte/SceneShotPlanner.svelte'
import ShotPreview from '@khaos-machine/khaotik-ui/components/svelte/ShotPreview.svelte'
import ShotInspector from '@khaos-machine/khaotik-ui/components/svelte/ShotInspector.svelte'
import StoryAtlasToolbar from '@khaos-machine/khaotik-ui/components/svelte/StoryAtlasToolbar.svelte'
import StoryAtlasRelationship from '@khaos-machine/khaotik-ui/components/svelte/StoryAtlasRelationship.svelte'
import StoryAtlas from '@khaos-machine/khaotik-ui/components/svelte/StoryAtlas.svelte'
// Drawn by StoryAtlas, whose fixture `plays` it; check-catalog requires the import.
import StoryAtlasCanvas from '@khaos-machine/khaotik-ui/components/svelte/StoryAtlasCanvas.svelte'
import storyAtlasData from './data/story-atlas.json'
import Menu from '@khaos-machine/khaotik-ui/components/svelte/Menu.svelte'
import SegmentedControl from '@khaos-machine/khaotik-ui/components/svelte/SegmentedControl.svelte'
import StatusPill from '@khaos-machine/khaotik-ui/components/svelte/StatusPill.svelte'
import Color from './components/brand/Color.svelte'
import Type from './components/brand/Type.svelte'
import Shape from './components/brand/Shape.svelte'
import Layout from './components/brand/Layout.svelte'
import Tokens from './components/brand/Tokens.svelte'
import IconSheet from './components/foundation/IconSheet.svelte'
import { weights as iconWeights } from './icon-inventory.js'
import MetricCard from '@khaos-machine/khaotik-ui/components/svelte/MetricCard.svelte'
import ProjectCard from '@khaos-machine/khaotik-ui/components/svelte/ProjectCard.svelte'
import AudioPlayback from '@khaos-machine/khaotik-ui/components/svelte/AudioPlayback.svelte'
import Waveform from '@khaos-machine/khaotik-ui/components/svelte/Waveform.svelte'
import SpeechControls from '@khaos-machine/khaotik-ui/components/svelte/SpeechControls.svelte'
import SpeakerPicker from '@khaos-machine/khaotik-ui/components/svelte/SpeakerPicker.svelte'
import LanguagePicker from '@khaos-machine/khaotik-ui/components/svelte/LanguagePicker.svelte'
import VoiceClonePanel from '@khaos-machine/khaotik-ui/components/svelte/VoiceClonePanel.svelte'
import VoiceDesignPanel from '@khaos-machine/khaotik-ui/components/svelte/VoiceDesignPanel.svelte'
import DialogueComposer from '@khaos-machine/khaotik-ui/components/svelte/DialogueComposer.svelte'
import VoiceStudio from '@khaos-machine/khaotik-ui/components/svelte/VoiceStudio.svelte'
import LabeledPill from '@khaos-machine/khaotik-ui/components/svelte/LabeledPill.svelte'
import MetaStrip from '@khaos-machine/khaotik-ui/components/svelte/MetaStrip.svelte'
import EditableField from '@khaos-machine/khaotik-ui/components/svelte/EditableField.svelte'
import SelectableRow from '@khaos-machine/khaotik-ui/components/svelte/SelectableRow.svelte'
import EmptyState from '@khaos-machine/khaotik-ui/components/svelte/EmptyState.svelte'
import SectionHeader from '@khaos-machine/khaotik-ui/components/svelte/SectionHeader.svelte'
import KhaosLogo from '@khaos-machine/khaotik-ui/components/svelte/KhaosLogo.svelte'
// Rendered by IconSheet, whose fixture `plays` it; check-catalog requires the import.
import Icon from '@khaos-machine/khaotik-ui/components/svelte/Icon.svelte'
import Gallery from '@khaos-machine/khaotik-ui/components/svelte/Gallery.svelte'
import LabeledField from '@khaos-machine/khaotik-ui/components/svelte/LabeledField.svelte'
import Portrait from '@khaos-machine/khaotik-ui/components/svelte/Portrait.svelte'
import ProviderBadge from '@khaos-machine/khaotik-ui/components/svelte/ProviderBadge.svelte'
import ProviderMark from '@khaos-machine/khaotik-ui/components/svelte/ProviderMark.svelte'
import ProviderSheet from './components/foundation/ProviderSheet.svelte'
import Button from '@khaos-machine/khaotik-ui/components/svelte/Button.svelte'
import FilterField from '@khaos-machine/khaotik-ui/components/svelte/FilterField.svelte'
import TextField from '@khaos-machine/khaotik-ui/components/svelte/TextField.svelte'
import TextAreaField from '@khaos-machine/khaotik-ui/components/svelte/TextAreaField.svelte'
import PasswordField from '@khaos-machine/khaotik-ui/components/svelte/PasswordField.svelte'
import CodeField from '@khaos-machine/khaotik-ui/components/svelte/CodeField.svelte'
import FormStack from '@khaos-machine/khaotik-ui/components/svelte/FormStack.svelte'
import StoryPlayer from '@khaos-machine/khaotik-ui/components/svelte/StoryPlayer.svelte'
import Player from '@khaos-machine/khaotik-ui/components/svelte/Player.svelte'
import Composer from '@khaos-machine/khaotik-ui/components/svelte/Composer.svelte'
import StoryPlayback from '@khaos-machine/khaotik-ui/components/svelte/StoryPlayback.svelte'
import storyPlaybackData from './data/story-playback.json'
import { buildTimeline } from '@khaos-machine/khaotik-ui/components/svelte/lib/timeline.js'
import Settings from '@khaos-machine/khaotik-ui/components/svelte/Settings.svelte'
import SettingsWindow from '@khaos-machine/khaotik-ui/components/svelte/SettingsWindow.svelte'
import ProjectSettings from '@khaos-machine/khaotik-ui/components/svelte/ProjectSettings.svelte'
import Toggle from '@khaos-machine/khaotik-ui/components/svelte/Toggle.svelte'
import ConfirmDialog from '@khaos-machine/khaotik-ui/components/svelte/ConfirmDialog.svelte'
import OutcomeBanner from '@khaos-machine/khaotik-ui/components/svelte/OutcomeBanner.svelte'
import ServiceStatusList from '@khaos-machine/khaotik-ui/components/svelte/ServiceStatusList.svelte'
import InstallList from '@khaos-machine/khaotik-ui/components/svelte/InstallList.svelte'
import SoundStudio from '@khaos-machine/khaotik-ui/components/svelte/SoundStudio.svelte'
import VoicePresetPanel from '@khaos-machine/khaotik-ui/components/svelte/VoicePresetPanel.svelte'
import SceneReadStatus from '@khaos-machine/khaotik-ui/components/svelte/SceneReadStatus.svelte'
import TakeList from '@khaos-machine/khaotik-ui/components/svelte/TakeList.svelte'
import InstallScript from '@khaos-machine/khaotik-ui/components/svelte/InstallScript.svelte'
import SetupProgress from '@khaos-machine/khaotik-ui/components/svelte/SetupProgress.svelte'
import ResourceCatalog from '@khaos-machine/khaotik-ui/components/svelte/ResourceCatalog.svelte'
import BarChart from '@khaos-machine/khaotik-ui/components/svelte/BarChart.svelte'
import MeasureTable from '@khaos-machine/khaotik-ui/components/svelte/MeasureTable.svelte'
import Composed from '@khaos-machine/khaotik-ui/components/svelte/Composed.svelte'
import Dock from '@khaos-machine/khaotik-ui/components/svelte/Dock.svelte'
import WelcomeWindow from '@khaos-machine/khaotik-ui/components/svelte/WelcomeWindow.svelte'
import LauncherWindow from '@khaos-machine/khaotik-ui/components/svelte/LauncherWindow.svelte'
import EngineDetails from '@khaos-machine/khaotik-ui/components/svelte/EngineDetails.svelte'
import Checkbox from '@khaos-machine/khaotik-ui/components/svelte/Checkbox.svelte'
import RadioChoiceList from '@khaos-machine/khaotik-ui/components/svelte/RadioChoiceList.svelte'
import EventLog from '@khaos-machine/khaotik-ui/components/svelte/EventLog.svelte'
import RenderStrip from '@khaos-machine/khaotik-ui/components/svelte/RenderStrip.svelte'
import Sheet from '@khaos-machine/khaotik-ui/components/svelte/Sheet.svelte'
import Popover from '@khaos-machine/khaotik-ui/components/svelte/Popover.svelte'
import StatusBar from '@khaos-machine/khaotik-ui/components/svelte/StatusBar.svelte'
import CommandPalette from '@khaos-machine/khaotik-ui/components/svelte/CommandPalette.svelte'
import ScrubNumber from '@khaos-machine/khaotik-ui/components/svelte/ScrubNumber.svelte'
import ScreenplayText from '@khaos-machine/khaotik-ui/components/svelte/ScreenplayText.svelte'
import TokenField from '@khaos-machine/khaotik-ui/components/svelte/TokenField.svelte'
import RenderMark from '@khaos-machine/khaotik-ui/components/svelte/RenderMark.svelte'
import InspectorSection from '@khaos-machine/khaotik-ui/components/svelte/InspectorSection.svelte'
import PropertyRow from '@khaos-machine/khaotik-ui/components/svelte/PropertyRow.svelte'
import DataTable from '@khaos-machine/khaotik-ui/components/svelte/DataTable.svelte'
import Toolbar from '@khaos-machine/khaotik-ui/components/svelte/Toolbar.svelte'
import SourceList from '@khaos-machine/khaotik-ui/components/svelte/SourceList.svelte'
import WorkspaceSwitcher from '@khaos-machine/khaotik-ui/components/svelte/WorkspaceSwitcher.svelte'
// The documents it renders live in their own module, and deliberately: a
// document literal here carries nested braces that check-taxonomy's regexes
// cannot cross. See that module's header.
import { composedExamples } from './editor/demo-document.js'

// Real KSPD data (BROKEN IN 4 PLACES), vendored into the catalog so lists
// render at real density: 54 scenes, 1050 dialogue lines, 27 characters, 26
// locations. (This said 289 dialogue lines, which was one character's count
// rather than the project's.)
import scenesData from './data/scenes.json'
import dialoguesData from './data/dialogues.json'
import charactersData from './data/characters.json'
import placeBuilderStates from './data/place-builder-states.json'
import storyOverview from './data/story-overview.json'
import readingReadiness from './data/reading-readiness.json'
import locationsData from './data/locations.json'
import characterAnalyses from './data/character-analyses.json'
import locationAnalyses from './data/location-analyses.json'
import sceneAnalyses from './data/scene-analyses.json'
import voicesData from './data/voices.json'
import castingData from './data/casting.json'
import providerStatus from './data/provider-status.json'
import compositionData from './data/composition.json'
import servicesData from './data/services.json'
import setupData from './data/setup.json'
import stalenessData from './data/staleness.json'
import AnalysisStale from '@khaos-machine/khaotik-ui/components/svelte/AnalysisStale.svelte'
import FinishSetupConfirm from '@khaos-machine/khaotik-ui/components/svelte/FinishSetupConfirm.svelte'
import GenerationFailureDetails from '@khaos-machine/khaotik-ui/components/svelte/GenerationFailureDetails.svelte'
import ImageThumb from '@khaos-machine/khaotik-ui/components/svelte/ImageThumb.svelte'
import PlaybackEventInspector from '@khaos-machine/khaotik-ui/components/svelte/PlaybackEventInspector.svelte'
import ProviderDisclosure from '@khaos-machine/khaotik-ui/components/svelte/ProviderDisclosure.svelte'
import QuitPrompt from '@khaos-machine/khaotik-ui/components/svelte/QuitPrompt.svelte'
import RefusalOffer from '@khaos-machine/khaotik-ui/components/svelte/RefusalOffer.svelte'
import StaleSheet from '@khaos-machine/khaotik-ui/components/svelte/StaleSheet.svelte'
import ProjectStatusHUD from '@khaos-machine/khaotik-ui/components/svelte/ProjectStatusHUD.svelte'
import Shell from '@khaos-machine/khaotik-ui/components/svelte/Shell.svelte'
import SubjectImages from '@khaos-machine/khaotik-ui/components/svelte/SubjectImages.svelte'
import DialogueInspector from '@khaos-machine/khaotik-ui/components/svelte/DialogueInspector.svelte'
import IdentitySide from '@khaos-machine/khaotik-ui/components/svelte/IdentitySide.svelte'
import LineInspector from '@khaos-machine/khaotik-ui/components/svelte/LineInspector.svelte'
import ReadTimeline from '@khaos-machine/khaotik-ui/components/svelte/ReadTimeline.svelte'
import SceneReads from '@khaos-machine/khaotik-ui/components/svelte/SceneReads.svelte'
import catalogData from './data/catalog.json'
import engineData from './data/engine.json'
import storyGraphData from './data/story-graph.json'
import sceneReadData from './data/scene-read.json'
import CharacterAliases from '@khaos-machine/khaotik-ui/components/svelte/CharacterAliases.svelte'
import CharacterAnalysis from '@khaos-machine/khaotik-ui/components/svelte/CharacterAnalysis.svelte'
import CharacterMentions from '@khaos-machine/khaotik-ui/components/svelte/CharacterMentions.svelte'
import CharacterRecordings from '@khaos-machine/khaotik-ui/components/svelte/CharacterRecordings.svelte'
import charactersDestination from './data/characters-destination.json'
import CharacterDetail from '@khaos-machine/khaotik-ui/components/svelte/CharacterDetail.svelte'
import CharacterSide from '@khaos-machine/khaotik-ui/components/svelte/CharacterSide.svelte'
import VoiceBrief from '@khaos-machine/khaotik-ui/components/svelte/VoiceBrief.svelte'
import voiceBriefs from './data/voice-briefs.json'
import CharacterTable from '@khaos-machine/khaotik-ui/components/svelte/CharacterTable.svelte'
import { NARRATOR } from '@khaos-machine/khaotik-ui/components/svelte/lib/characters.js'
import SceneAnalysis from '@khaos-machine/khaotik-ui/components/svelte/SceneAnalysis.svelte'
import SceneDetail from '@khaos-machine/khaotik-ui/components/svelte/SceneDetail.svelte'
import SceneSide from '@khaos-machine/khaotik-ui/components/svelte/SceneSide.svelte'
import SceneTable from '@khaos-machine/khaotik-ui/components/svelte/SceneTable.svelte'
import scenesDestination from './data/scenes-destination.json'
import LocationHeadings from '@khaos-machine/khaotik-ui/components/svelte/LocationHeadings.svelte'
import ObjectDetail from '@khaos-machine/khaotik-ui/components/svelte/ObjectDetail.svelte'
import ObjectSide from '@khaos-machine/khaotik-ui/components/svelte/ObjectSide.svelte'
import ObjectTable from '@khaos-machine/khaotik-ui/components/svelte/ObjectTable.svelte'
import PlaceAnalysis from '@khaos-machine/khaotik-ui/components/svelte/PlaceAnalysis.svelte'
import PlaceAreas from '@khaos-machine/khaotik-ui/components/svelte/PlaceAreas.svelte'
import PlaceDetail from '@khaos-machine/khaotik-ui/components/svelte/PlaceDetail.svelte'
import StoryOverview from '@khaos-machine/khaotik-ui/components/svelte/StoryOverview.svelte'
import StoryOverviewOutline from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewOutline.svelte'
import StoryOverviewSide from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewSide.svelte'
import StoryOverviewStrip from '@khaos-machine/khaotik-ui/components/svelte/StoryOverviewStrip.svelte'
import ReadingReadiness from '@khaos-machine/khaotik-ui/components/svelte/ReadingReadiness.svelte'
import PlaceSide from '@khaos-machine/khaotik-ui/components/svelte/PlaceSide.svelte'
import PlaceTable from '@khaos-machine/khaotik-ui/components/svelte/PlaceTable.svelte'
import PlacePlan from '@khaos-machine/khaotik-ui/components/svelte/PlacePlan.svelte'
import PlaceViewer from '@khaos-machine/khaotik-ui/components/svelte/PlaceViewer.svelte'
// The kit's constructed conformance place, at the kit version khaosd serves (data/place-conformance/README.md).
import placeConformance from './data/place-conformance/definition.json'
import placeConformanceModelData from './data/place-conformance/model.glb?inline'
import PlaceReview from '@khaos-machine/khaotik-ui/components/svelte/PlaceReview.svelte'
import PlaceBuildRounds from '@khaos-machine/khaotik-ui/components/svelte/PlaceBuildRounds.svelte'
import PlaceStructure from '@khaos-machine/khaotik-ui/components/svelte/PlaceStructure.svelte'
import ShotPrevis from '@khaos-machine/khaotik-ui/components/svelte/ShotPrevis.svelte'
import ShotPlan from '@khaos-machine/khaotik-ui/components/svelte/ShotPlan.svelte'
// The kit's constructed conformance shot and its own models, at khaos-previs-kit v0.8.0
// (data/shot-conformance/README.md), as a shot of khaosd's previs read.
import { blocking as shotBlocking, crateDefinition as shotCrate, definition as shotPlace, previsShot, ROVER_KEY, twinShot } from './data/shot-conformance/previs.js'
import shotPlaceModelData from './data/shot-conformance/place.glb?inline'
import shotRoverModelData from './data/shot-conformance/rover.glb?inline'
import shotCrateModelData from './data/shot-conformance/crate.glb?inline'
// The viewer takes the model as bytes, as the app passes them after reading khaosd's .glb over
// its byte transport. The catalog inlines the fixture and decodes it, so nothing is fetched.
/** @param {string} data An inlined asset's data: URL. */
const inlineBytes = (data) => Uint8Array.from(atob(data.split(',')[1]), (c) => c.charCodeAt(0))
const placeConformanceModel = inlineBytes(placeConformanceModelData)
// One scene's previs models, as the app hands them over after reading them for the scene.
const shotPrevisScene = {
  definition: shotPlace,
  place: inlineBytes(shotPlaceModelData),
  figures: { [ROVER_KEY]: inlineBytes(shotRoverModelData) },
  objects: { Crate: inlineBytes(shotCrateModelData) },
  oncamera: () => {},
  onload: () => {},
}
// The same shot's plan, with the Crate's definition for its footprint.
const shotPlanReady = { blocking: shotBlocking, definition: shotPlace, objectDefinitions: { Crate: shotCrate }, names: { Rover: 'Rover', Crate: 'Crate' }, onselect: () => {}, onfigure: () => {} }
// Constructed from the conformance place: a review-ready revision with its two cameras as sheet
// panels and the agent's panel checks. The kit ships no line art or sheet image for it, so the
// catalog shows the sheet's and the panels' missing-image state.
const placeReviewDefinition = {
  ...placeConformance,
  id: 'place_definition_conformance',
  designRevisionIds: ['design_revision_conformance'],
  cameras: placeConformance.cameras.map((c, i) => ({ ...c, purpose: 'sheetPanel', sheet: { designRevisionId: 'design_revision_conformance', panel: i + 1 } })),
  panelChecks: [
    { cameraId: 'Corner', verdict: 'matches' },
    { cameraId: 'Back', verdict: 'differs', mismatches: ['The desk sits against the back wall in the sheet.'] },
  ],
  review: { state: 'unreviewed', notes: '' },
}
const placeReviewDraft = {
  ...placeReviewDefinition,
  openings: placeReviewDefinition.openings.map((o) => (o.id === 'Doorway' ? { ...o, width: 1.1 } : o)),
}
// A Place Build's rounds, from the line art khaosd 0.188.0 serves for one real job
// (data/place-build-rounds/README.md). Round 1's draft cannot be built, so it has no picture.
const buildRoundArt = import.meta.glob('./data/place-build-rounds/*.webp', { eager: true, query: '?inline', import: 'default' })
const BUILD_CAMERAS = [['SheetPanel1KitchenLiving', 'Sheet panel 1 kitchen living'], ['SheetPanel2Bedroom', 'Sheet panel 2 bedroom'], ['SheetPanel3Hallway', 'Sheet panel 3 hallway'], ['SheetPanel4Bathroom', 'Sheet panel 4 bathroom']]
/** @param {number} round @param {string} camera */
const buildArt = (round, camera) => buildRoundArt[`./data/place-build-rounds/round${round}-${camera}.webp`]
const buildRounds = [1, 2, 3, 4].map((round) => ({ round, kind: 'draft', problems: 0, thumbnail: buildArt(round, 'SheetPanel2Bedroom') }))
const BUILD_PROBLEMS = { SheetPanel2Bedroom: ['The camera is inside the fixture BedroomBed.', 'A wall blocks most of the view.'], SheetPanel4Bathroom: ['The view looks through a closed door.'] }
/** @param {number} round @param {boolean} [problems] */
const buildRoundDetail = (round, problems = false) => ({
  cameras: BUILD_CAMERAS.map(([id, label]) => ({ id, label, url: buildArt(round, id), problems: (problems && BUILD_PROBLEMS[id]) || [] })),
  unseenRooms: problems ? ['Linen closet'] : [],
})
const buildRoundsWithProblems = buildRounds.map((r, i) => ({ ...r, problems: [2, 1, 0, 3][i], kind: i === 3 ? 'final' : 'draft' }))
const buildRounds24 = Array.from({ length: 24 }, (_, i) => ({ ...buildRounds[i % 4], round: i + 1, problems: i % 5 === 2 ? 1 : 0, kind: i === 23 ? 'final' : 'draft' }))
const placeReviewReady = { advanced: true, definition: placeReviewDefinition, model: placeConformanceModel, onselect: () => {}, onload: () => {}, onreview: () => {}, onedit: () => {}, onsave: () => {}, onreload: () => {}, onopenblender: () => {} }
import SubjectDesign from '@khaos-machine/khaotik-ui/components/svelte/SubjectDesign.svelte'
import placesDestination from './data/places-destination.json'
import AudioDetail from '@khaos-machine/khaotik-ui/components/svelte/AudioDetail.svelte'
import AudioSide from '@khaos-machine/khaotik-ui/components/svelte/AudioSide.svelte'
import AudioTable from '@khaos-machine/khaotik-ui/components/svelte/AudioTable.svelte'
import ImageDetail from '@khaos-machine/khaotik-ui/components/svelte/ImageDetail.svelte'
import ImageSide from '@khaos-machine/khaotik-ui/components/svelte/ImageSide.svelte'
import ImageTable from '@khaos-machine/khaotik-ui/components/svelte/ImageTable.svelte'
import RefusedTakes from '@khaos-machine/khaotik-ui/components/svelte/RefusedTakes.svelte'
import { imageRows } from '@khaos-machine/khaotik-ui/components/svelte/lib/images.js'
import imagesAudio from './data/images-audio-destination.json'
import ExtractionReview from '@khaos-machine/khaotik-ui/components/svelte/ExtractionReview.svelte'
import ReviewOccurrences from '@khaos-machine/khaotik-ui/components/svelte/ReviewOccurrences.svelte'
import ReviewQueue from '@khaos-machine/khaotik-ui/components/svelte/ReviewQueue.svelte'
import ReviewSide from '@khaos-machine/khaotik-ui/components/svelte/ReviewSide.svelte'
import ReviewSuggestions from '@khaos-machine/khaotik-ui/components/svelte/ReviewSuggestions.svelte'
import { characterNamed, nameIn, reviewTitle } from '@khaos-machine/khaotik-ui/components/svelte/lib/review.js'
import reviewDestination from './data/review-destination.json'
import Activity from '@khaos-machine/khaotik-ui/components/svelte/Activity.svelte'
import ModelsPane from '@khaos-machine/khaotik-ui/components/svelte/ModelsPane.svelte'
import BudgetPane from '@khaos-machine/khaotik-ui/components/svelte/BudgetPane.svelte'
import ProviderSetup from '@khaos-machine/khaotik-ui/components/svelte/ProviderSetup.svelte'
import SetupConnect from '@khaos-machine/khaotik-ui/components/svelte/SetupConnect.svelte'
import Setup from '@khaos-machine/khaotik-ui/components/svelte/Setup.svelte'
import ProblemReport from '@khaos-machine/khaotik-ui/components/svelte/ProblemReport.svelte'
import ProjectHistory from '@khaos-machine/khaotik-ui/components/svelte/ProjectHistory.svelte'
import ProjectWindow from '@khaos-machine/khaotik-ui/components/svelte/ProjectWindow.svelte'
import Resources from '@khaos-machine/khaotik-ui/components/svelte/Resources.svelte'
import Splash from '@khaos-machine/khaotik-ui/components/svelte/Splash.svelte'
import VoiceRow from '@khaos-machine/khaotik-ui/components/svelte/VoiceRow.svelte'
import Voices from '@khaos-machine/khaotik-ui/components/svelte/Voices.svelte'
import appWindowsData from './data/app-windows.json'

import { DEMO_COVER, DEMO_COVER_SRCSET, demoFigureFor } from './demo-cover.js'
import { createRawSnippet } from 'svelte'

// Button's label is a snippet, so its examples pass one built from plain text.
const buttonLabel = (text) => createRawSnippet(() => ({ render: () => `<span>${text}</span>` }))

// The desktop shell's fixtures (data-layer plan, Phase K). The Story preset of audit
// §3.3, with the captured B4P characters and scenes in its panes so the panes carry
// real content rather than names.
const escapeHtml = (text) => String(text).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const dockPanels = {
  source: { label: 'Story', min: 180, size: 220 },
  table: { label: 'Characters', min: 320, size: 420 },
  detail: { label: 'Detail', min: 280 },
  inspector: { label: 'Inspector', min: 260, size: 300 },
  activity: { label: 'Activity', min: 260, size: 300 },
}
const dockStory = {
  kind: 'split', id: 'root', direction: 'row', fixed: 'start', size: 220,
  children: [
    { kind: 'group', id: 'g-source', panels: ['source'], active: 'source' },
    {
      kind: 'split', id: 'right', direction: 'row', fixed: 'end', size: 300, overlay: true,
      children: [
        {
          kind: 'split', id: 'middle', direction: 'row', fixed: 'start', size: 420,
          children: [
            { kind: 'group', id: 'g-table', panels: ['table'], active: 'table' },
            { kind: 'group', id: 'g-detail', panels: ['detail'], active: 'detail' },
          ],
        },
        { kind: 'group', id: 'g-inspector', panels: ['inspector', 'activity'], active: 'inspector' },
      ],
    },
  ],
}
const dockPanelBody = {
  source: () => `<ul style="margin:0;padding:8px;list-style:none">${['Characters', 'Scenes', 'Places', 'Objects'].map((x) => `<li>${x}</li>`).join('')}</ul>`,
  table: () => `<ul style="margin:0;padding:8px;list-style:none">${charactersData.slice(0, 20).map((c) => `<li>${escapeHtml(c.name)}</li>`).join('')}</ul>`,
  detail: () => `<p style="margin:0;padding:8px">${escapeHtml(charactersData[0]?.name ?? '')}</p>`,
  inspector: () => `<p style="margin:0;padding:8px">${escapeHtml(scenesData[0]?.slugline ?? '')}</p>`,
  activity: () => '<p style="margin:0;padding:8px">No activity in this capture.</p>',
}
// The Story window's destinations, counted from the B4P capture. Objects is the
// capture's honest zero (audit §1.8); Review carries no count, so none renders.
const sourceSections = [
  {
    id: 'story', label: 'Story',
    items: [
      { id: 'characters', label: 'Characters', icon: 'user', count: charactersData.length },
      { id: 'scenes', label: 'Scenes', icon: 'film-slate', count: scenesData.length },
      { id: 'places', label: 'Places', icon: 'map-pin', count: locationsData.length },
      { id: 'objects', label: 'Objects', icon: 'cube', count: 0 },
    ],
  },
  { id: 'work', label: 'Work', items: [{ id: 'review', label: 'Review', icon: 'flag' }] },
]
// The data layer's short-term four modes (plan OQ2, OQ3: Assemble is later).
const workspaceModes = [
  { value: 'story', label: 'Story' },
  { value: 'review', label: 'Review' },
  { value: 'cast', label: 'Cast' },
  { value: 'perform', label: 'Perform' },
]
// The toolbar's command buttons. The disabled reason is the audit's own example of
// engine state the registry reads (audit §3.11).
const toolbarCommands = [
  { id: 'character.cast', label: 'Cast voice', icon: 'microphone', shortcut: '⌘⏎' },
  { id: 'scene.read', label: 'Read scene', icon: 'play', disabledReason: 'DESMOND has no voice' },
]
const toolbarPanes = [
  { id: 'source', label: 'Source list', icon: 'sidebar-simple', shown: true },
  { id: 'inspector', label: 'Inspector', icon: 'sidebar', shown: true },
]
// DataTable's fixture: the 1,050 captured B4P dialogue lines, enough to scroll a
// virtualised window through, grouped by scene in the second example.
const dialogueColumns = [
  { key: 'character', label: 'Character', width: '140px', value: (d) => d.character },
  { key: 'text', label: 'Line', width: 'minmax(240px, 1fr)', value: (d) => d.text },
  { key: 'scene', label: 'Scene', width: 'minmax(160px, 260px)', value: (d) => d.scene_slugline },
]
// ScreenplayText's fixture: the opening scene as the captured composition serves it,
// a slugline then each event, with a character cue before each line of dialogue.
const screenplayElements = (segment) => [
  { id: `${segment.sceneId}:slug`, kind: 'slugline', text: segment.label },
  ...segment.events.flatMap((e) =>
    e.elementType === 'dialogue' && e.characterName
      ? [{ id: `${e.elementId}:cue`, kind: 'character', text: e.characterName }, { id: e.elementId, kind: 'dialogue', text: e.text }]
      : [{ id: e.elementId, kind: e.elementType, text: e.text }]),
]
const screenplayDocument = {title:'BROKEN IN 4 PLACES',scenes:compositionData.segments.filter(segment=>segment.sceneId).map(segment=>({id:segment.sceneId,heading:segment.label,blocks:segment.events.map(event=>({id:event.elementId,kind:event.elementType,text:event.text??'',speaker:event.characterName??'',parenthetical:event.parenthetical??'',centered:false,simultaneous:false,editable:['action','dialogue'].includes(event.elementType)}))}))}
// CommandPalette's commands: the toolbar's, plus the window ones the registry will hold.
const paletteCommands = [
  ...toolbarCommands.map((c) => ({ ...c, group: c.id.startsWith('scene') ? 'Scene' : 'Character' })),
  { id: 'window.reset', label: 'Reset Workspace', group: 'Window' },
  { id: 'window.inspector', label: 'Show Inspector', group: 'Window', shortcut: '⌥⌘I' },
]
// The Voice pop-up's items: the captured voice catalog, the same-named voice suggested.
const voiceItems = voicesData.slice(0, 12).map((v) => ({ id: v.id, label: v.name, detail: v.provider ?? '' }))
const dockPanel = createRawSnippet((id) => ({ render: () => `<div>${(dockPanelBody[id()] ?? (() => ''))()}</div>` }))

// The real cast assignment from casting.json (characterId → voiceProfileId),
// joined against the voice catalog (voices.json). A cast whose voice
// profile is missing from the catalog stays honestly unresolved (voice: null) —
// the Casting tab renders that empty state, never a fabricated voice.
const castFor = (character) => {
  const entry = castingData.find((c) => c.characterId === character.id)
  if (!entry) return { voice: null, casting: null }
  const voice = voicesData.find((v) => v.id === entry.voiceProfileId) ?? null
  return {
    voice,
    casting: {
      voiceProfileId: entry.voiceProfileId,
      voiceProfileName: voice?.name ?? entry.voiceProfileName ?? '',
      manualOverride: entry.manualOverride ?? false,
    },
  }
}

// Menu's #223 examples — groups, unavailable items, a current value outside the
// items. Every value is read from a capture here, none typed in:
//
//   voices.json           id → `value`, name → `label`, provider → `group`,
//                         providerId → `groupMark`; the openai, kittentts and
//                         elevenlabs voices only
//   provider-status.json  `isReady: false` for a providerId → `unavailable`
//                         (kittentts and elevenlabs; openai is ready)
//   services.json         `state` of the service whose id is the providerId →
//                         `reason`. Captured: kittentts is "stopped". There is
//                         no elevenlabs service, so its voices are unavailable
//                         with NO reason — the honest state, not a gap filled
//   "Current value unavailable, no reason" sets `value` to the first
//   elevenlabs voice: unavailable because provider-status.json has
//   elevenlabs at `isReady: false`, reasonless because services.json has no
//   elevenlabs entry — the same basis as the elevenlabs items above
//   casting.json          the first stored assignment whose `voiceProfileId` is
//                         absent from voices.json and which carries a
//                         `voiceProfileName` — a real stored voice the live
//                         catalog no longer serves (`castFor` above treats the
//                         same case as unresolved)
//
// GAPS, stated rather than papered over:
//   - Nothing captured carries khaos-manager#364's `route_options`, per-model
//     readiness, or an engine's own reason string. These examples show Menu's
//     shape with voice lists, not routing data.
//   - "stopped" is a SERVICE state, not an engine reason.
//   - No captured value is `''`, so the provider-default `''` item and the
//     `''`-matching-nothing trigger are covered by Menu.test.js (A4, A4b) only.
const MENU_PROVIDERS = ['openai', 'kittentts', 'elevenlabs']
const menuVoiceItems = voicesData
  .filter((v) => MENU_PROVIDERS.includes(v.providerId))
  .map((v) => {
    const ready = providerStatus.find((p) => p.id === v.providerId)?.isReady === true
    const state = servicesData.find((svc) => svc.id === v.providerId)?.state
    return {
      value: v.id,
      label: v.name,
      group: v.provider,
      groupMark: v.providerId,
      ...(ready ? {} : { unavailable: true, ...(state ? { reason: state } : {}) }),
    }
  })
const menuFirstVoice = (providerId) => voicesData.find((v) => v.providerId === providerId)?.id ?? ''
const voiceIds = new Set(voicesData.map((v) => v.id))
const menuStoredElsewhere = castingData.find((c) => !voiceIds.has(c.voiceProfileId) && c.voiceProfileName)

// Real character stats for the builder (no fabricated line/word/scene counts).
// THE CAPTURE IS STALE FOR ONE KEY, and it cannot be refreshed here: #123 and
// #83 mean `fetch-kspd.sh` cannot run and the source package is not on this
// machine. So the rename is applied in the FIXTURE LAYER rather than by editing
// the capture, which has exactly one producer.
//
// khaosd renamed `dialogue_count` to `dialogue_lines` after this capture was
// taken (2026-08-15). Measured by khaos-app against a live khaosd 0.20.0 across
// four projects and 247 character rows: zero carry the old name, and both
// `dashboard/characters` and `story/graph` serve the new one. `story-graph.json`
// in this same directory already carries `dialogue_lines`, captured one day
// later — the two captures straddle the rename.
//
// This renames a key whose rename is measured. It invents no VALUE, which is the
// line the real-data rule draws. Delete it the moment a fresh capture lands.
const characters = charactersData.map(({ dialogue_count, ...rest }) =>
  dialogue_count === undefined ? rest : { ...rest, dialogue_lines: dialogue_count },
)

// Column order is editorial, never inferred: dialogue first because it is what
// a reader looks for, scenes last because it is the coarsest.
const MEASURE_COLUMNS = [
  { key: 'dialogue_lines', label: 'Lines' },
  { key: 'word_count', label: 'Words' },
  { key: 'scene_count', label: 'Scenes' },
]

const desmond = characters.find((c) => c.name === 'Desmond') ?? characters[0]

// Real rows for the row atoms, taken from the same vendored KSPD data the
// lists render — a row fixture built from a hand-written object would drift
// from the list above it without anything noticing.
// The shared identity for the ProjectCard state matrix below. Everything here
// is taken from the 'Populated' example below, so the illustrative rows vary the
// state field under test and little else. Not verbatim: `ingested: true` and
// `git_changed_files: 9` are dropped, so the git chip differs from Populated's
// too. Said exactly, because "vary ONLY the state field" was the claim and it
// was slightly wider than the truth.
//
// Precisely: 'Populated' is itself a hand-written literal, not a capture. There
// is no projects capture in `apps/catalog/src/data/` — the daemon's project list
// was never fetched into one — so D62(c) is vacuous here rather than satisfied,
// and D62(b) is met by inheriting an identity the repo already shipped rather
// than by provenance. Saying "from the live capture" would claim a capture that
// does not exist. D62's second condition is that values
// come from the producer's shape rather than invented prose; keeping the
// identity real means a reader comparing the catalog to a live launcher sees
// the same card, in a state the capture cannot currently reach.
//
// Deliberately carries NO `analyses` and NO `package_stage`: each row
// supplies exactly the state it exists to render, so a reader can see at the
// row what is being varied without tracing a spread.
// A pending import's row (docs/design/project-card-progress.md, "Importing
// from the first moment"): the file's base name and nothing measured.
const IMPORT_ROW = { id: 'import:pending', title: 'broken-in-4-places' }

// The rail's analyses, in the shape khaos-app builds from khaosd's
// `GET /api/analysis/staleness`; the card's status label reads the same ones.
const ALL_ANALYSED = ['scenes', 'characters', 'places'].map((kind) => ({ kind, state: 'done' }))
const SCENES_ANALYSING = [{ kind: 'scenes', state: 'in-progress', progress: { completed: 31, total: 107 } }]

const PROJECT_BASE = {
  id: 'story_01KJXTKAMJ84E5S7K9J21ZKQZ7',
  title: 'BROKEN IN 4 PLACES',
  path: '/Users/k/khaos/projects/broken in 4 places.kspd',
  scene_count: 54, character_count: 27, location_count: 26,
  parsed: true,
  git_repo: true, git_has_remote: false,
  modified: 1782347691,
}

// A premium and a standard voice from the voice catalog, for the badge.
const premiumVoice = voicesData.find((v) => v.qualityTier === 'premium')
// khaosd's refusal to draw peaks from a non-WAV generation, in its own words
// (khaos-manager cmd/khaosd/synth.go, AUDIO_NOT_DECODABLE). ILLUSTRATIVE as a pairing
// (D62): the clip it is shown beside is not that generation.
const peaksFailure = "the generation's audio is audio/mpeg; peaks are drawn from audio/wav only"
const standardVoice = voicesData.find((v) => v.qualityTier === 'standard')

// TakeList (#216). ILLUSTRATIVE, NOT CAPTURED (D62): khaosd serves no take
// route until khaos-manager's M1 slice ships `GET /api/story/takes`, so there is
// no payload to capture. What IS real: the speaker and line (Madison's first line
// in dialogues.json), her cast voice (casting.json joined to voices.json by
// `castFor`), and that voice's audition clip (public/samples/) as the playable
// audio, standing in for take audio that does not exist yet. The ids, labels and times are
// invented to fill the shape; replace them with a capture once M1 serves one.
//
// THE SHAPE IS THE ENGINE'S (#217 review, F3). Ids are `take_` plus a ULID, as
// plan K4 mints them, and each ULID's time part encodes that take's `createdAt`,
// because K4 compares the two. The random part is fixed so the fixture is stable.
// The list is NEWEST FIRST, the order M1's `ListTakes` returns. `takesAfter(n)`
// is the listing as it stood once n takes existed: Take n down to Take 1.
const takeSpeaker = charactersData.find((c) => c.name === 'Madison')
const takeLine = dialoguesData.find((d) => d.character === 'Madison')
const takeVoice = takeSpeaker ? castFor(takeSpeaker).voice : null
const illustrativeTakes = [
  ['take_01M3MY59D08KE4YS5PJ1WZN3FA', 'Take 6', '2026-09-28T21:19:00Z'],
  ['take_01M3MXZSM01CV6TB9QX2DM7RGH', 'Take 5', '2026-09-28T21:16:00Z'],
  ['take_01M3MXT9V05ZP8HN3WJ0FKSY4E', 'Take 4', '2026-09-28T21:13:00Z'],
  ['take_01M3MXMT209D4KR2XV7MT1QB6C', 'Take 3', '2026-09-28T21:10:00Z'],
  ['take_01M3MXFA903HNW6FZP0SJ5EYGA', 'Take 2', '2026-09-28T21:07:00Z'],
  ['take_01M3MX9TG07Q2M9XK4TD1VBC8R', 'Take 1', '2026-09-28T21:04:00Z'],
].map(([id, label, createdAt]) => ({
  id,
  label,
  createdAt,
  voiceName: takeVoice?.name ?? '',
  src: takeVoice?.sampleURL ?? '',
}))
const takesAfter = (n) => illustrativeTakes.slice(-n)
// Instantiated from the daemon's own format string for UNCAST_CHARACTER
// (khaos-manager `cmd/khaosd/synth_table_read.go`, `dialogueLineFor`), with ids
// from the vendored data. Madison IS cast in casting.json; the sentence shows the
// wording and shape, not a state this project is in.
const uncastReason = `element ${takeLine?.element_id ?? ''}: character ${takeSpeaker?.id ?? ''} has no cast voice`
// KSPD's own refusal for a package whose ledger is older than v3, as the error
// chain renders it: `ErrNotConformant` (kspdprotocol `write_errors.go`) wrapped
// by `readRecoveryLedger` (`story_transaction_recovery.go`). khaosd surfaces it
// as PACKAGE_NOT_TRANSACTIONAL; its own wording lands with M1 and may differ.
const noTakesReason = 'kspd: document does not conform: story transaction needs a v3 ledger'
// KSPD's own `ErrStoryDataConflict` text (kspdprotocol `write_errors.go`), which
// revision 4 makes the answer for a take whose audio file is missing.
const takeConflict = 'kspd: story data differs from committed snapshot'
const takeHandlers = { onGenerate: () => {}, onChoose: () => {}, onDelete: () => {}, onDownload: () => {} }
// VoiceStudio's lock mode (D90): a designed voice, made up for the catalog — see its examples.
const lockLine = dialoguesData.find((d) => d.character === 'Madison' && !/[.!?]\s/.test(d.text))
const lockingVoice = { name: 'Narrator', description: 'A calm, low storyteller who lets each line land', locked: false }

// The nine preset speakers Qwen3-TTS CustomVoice ships — the `voice` field on a
// speech request. A fixed set, documented in khaos-synth's speech stack.
const presetSpeakers = [
  { id: 'aiden', name: 'Aiden' },
  { id: 'serena', name: 'Serena' },
  { id: 'vivian', name: 'Vivian' },
  { id: 'eric', name: 'Eric' },
  { id: 'ryan', name: 'Ryan' },
  { id: 'dylan', name: 'Dylan' },
  { id: 'sohee', name: 'Sohee' },
  { id: 'ono_anna', name: 'Ono Anna' },
  { id: 'uncle_fu', name: 'Uncle Fu' },
]

// BarChart's distributions, counted from the committed scenes rather than typed
// in — the fetch now carries `timeOfDay` and `type` for exactly this. Derived
// rather than literal so the chart cannot quietly disagree with the scene list
// beside it in the catalog.
const countBy = (key) => {
  const counts = new Map()
  for (const scene of scenesData) {
    const value = scene[key]
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }))
}
const timeOfDay = countBy('timeOfDay')
const sceneType = countBy('type')

// The location-inspector case: a ranked list, from the real per-character scene
// counts in characters.json.
const occupants = charactersData
  .slice()
  .sort((a, b) => (b.scene_count ?? 0) - (a.scene_count ?? 0))
  .slice(0, 6)
  .map((c) => ({ label: c.name, value: c.scene_count ?? 0 }))

// The Settings rail as Khaos App draws it: its panes in order
// (khaos-app src/app/settings.svelte.ts:84-91), with Routing, On-device Engines
// and Models shown only on the Advanced path (:75-76, :600).
const SETTINGS_PANES = [
  { id: 'providers', label: 'Providers', icon: 'cpu' },
  { id: 'routing', label: 'Routing', icon: 'signpost' },
  { id: 'engines', label: 'On-device Engines', icon: 'waveform' },
  { id: 'models', label: 'Models', icon: 'database' },
  { id: 'engine', label: 'Engine', icon: 'lightning' },
  { id: 'general', label: 'General', icon: 'gear' },
]
const ADVANCED_ONLY_PANES = new Set(['routing', 'engines', 'models'])
const settingsPanesFor = (path) => (path === 'basic' ? SETTINGS_PANES.filter((p) => !ADVANCED_ONLY_PANES.has(p.id)) : SETTINGS_PANES)

// The Basic-or-Advanced choice, worded as Khaos App words it
// (khaos-app src/app/onboarding.svelte.ts, pathChoices) from khaosd's captured
// setup (setup.json). What Advanced needs comes from the engine verbatim. The
// capture carries no download size, so the size sentence is the app's
// "not known yet" one.
const capturedSetup = setupData.setup
const advancedNeeds = [
  capturedSetup.advanced.dependencies.length > 0 ? `Needs ${capturedSetup.advanced.dependencies.join(', ')}.` : '',
  capturedSetup.advanced.storage_bytes === null ? 'Model downloads are large; the size is not known yet.' : '',
].filter(Boolean).join(' ')
const PATH_TITLES = { basic: 'Basic', advanced: 'Advanced' }
const PATH_CAPTIONS = {
  basic: 'Use AI services in the cloud with your account. Nothing to install.',
  advanced: `Run models on this Mac and choose providers yourself. ${advancedNeeds}`,
}
const pathChoices = capturedSetup.offered.map((value) => ({
  value,
  title: value === capturedSetup.suggested ? `${PATH_TITLES[value]} (recommended)` : PATH_TITLES[value],
  caption: PATH_CAPTIONS[value],
}))
// SettingsWindow's Providers head, from the captured setup.
/** @param {boolean} advanced */
const settingsWindowPath = (advanced) => ({
  path: advanced ? 'advanced' : capturedSetup.path, options: pathChoices, advancedCaption: PATH_CAPTIONS.advanced,
  saving: false, error: '', advanced, history: advanced, gitSync: false, featureSaving: false, featureError: '', needed: [], installable: [],
})
// Routing rows: one grouped picker that is ready, and one capability that is read-only (illustrative).
const settingsWindowRouting = [{
  id: 'text', title: 'Text', rows: [
    { id: 'analysis.text', label: 'Analysis', enabled: true, providerTitle: 'OpenRouter', modelLabel: 'deepseek-v4.1-flash', routeLabel: 'OpenRouter · deepseek-v4.1-flash', tone: 'success', quietModel: true, note: '', error: '',
      control: { kind: 'grouped', selectedKey: 'openrouter/deepseek-v4.1-flash', groups: [{ title: 'OpenRouter', options: [{ key: 'openrouter/deepseek-v4.1-flash', label: 'deepseek-v4.1-flash', disabled: false }] }] } },
    { id: 'chat.project', label: 'Project chat', enabled: false, providerTitle: '', modelLabel: '', routeLabel: 'Not routed', tone: 'neutral', quietModel: false, note: 'khaosd routes this capability nowhere yet.', error: '', control: { kind: 'read-only' } },
  ],
}]

// Real readiness, straight from provider-status.json — `anthropic` shows as not
// ready because it is not ready, which is the state a settings screen exists to
// report. StatusPill rather than LabeledField because the canvas nests one level
// of slotted content, and a label column with nothing in it says less than a
// pill that carries the answer.
// ProviderSetup's list, from the captured readiness: running servers read as ready.
const setupProviders = providerStatus.slice(0, 6).map((p) => ({
  id: p.id,
  title: p.id,
  description: '',
  connection: p.isReady ? 'connected' : 'not-connected',
  baseUrl: '',
  setupUrl: '',
  docsUrl: '',
  setupInstructions: '',
}))

// Setup's checklist: the tools khaosd's health reports (engine.json), each as it stands.
const setupSections = [{
  id: 'required', title: 'Required', installable: [], emptyLabel: 'khaosd reported nothing required.',
  items: engineData.tools.map((tool) => ({ id: tool.id, name: tool.id, state: tool.available ? 'installed' : 'available', required: true, caption: tool.semver ?? '' })),
}]
const setupDigest = [
  { id: 'required', title: 'What Khaos needs', purpose: 'The tools Khaos Machine runs on.', status: 'Ready', settled: true, ready: setupSections[0].items.length, total: setupSections[0].items.length },
  { id: 'engines', title: 'On-device engines', purpose: 'Speech that runs on this Mac.', status: 'Not set up', settled: false, ready: 0, total: 2 },
]
/** @param {'path' | 'features' | 'summary'} view */
const setupOnboarding = (view) => ({
  view, changing: false, stepAt: view === 'summary' ? 0 : view === 'path' ? 1 : 2, stepCount: 3, refusal: null, saving: false,
  path: { choice: capturedSetup.path ?? '', options: pathChoices },
  configuration: null,
  preference: { choice: 'cloud', options: [], note: '', because: [] },
  features: [
    { id: 'analysis', title: 'Analyse my scripts', caption: 'Reads a screenplay and finds its characters, places and scenes.', locked: true, checked: true, cloudOnly: false },
    { id: 'voices', title: 'Voices and table reads', caption: 'Hear the script read aloud.', locked: false, checked: true, cloudOnly: false },
    { id: 'chat', title: 'Ask about my story', caption: 'Ask questions about the script.', locked: false, checked: false, cloudOnly: false },
  ],
  summary: {
    pathTitle: PATH_TITLES[capturedSetup.path] ?? null, canChangePath: capturedSetup.offered.length > 1, preferenceTitle: null,
    turnedOn: 'Analyse my scripts, Voices and table reads', connections: 'OpenRouter: Connected · Gemini TTS: Connected',
    deviceTitle: 'This Mac', device: 'Nothing needed for the cloud',
  },
})

// The Voices window's list: the first captured voices, as the synth's presets.
// The open stories a hosted voice can be paid from (khaos-app#615). ILLUSTRATIVE: two share a
// title, as two packages of one script do, and are told apart by their file name.
const voicesStories = [
  { id: '/Users/writer/khaos/projects/b4p.kspd', label: 'BROKEN IN 4 PLACES' },
  { id: '/Users/writer/khaos/projects/broken-in-4-places proof.kspd', label: 'BROKEN IN 4 PLACES' },
  { id: '/Users/writer/khaos/projects/parallel-lives.kspd', label: 'PARALLEL LIVES' },
]
const voicesWindowVoices = voicesData.slice(0, 8).map((v) => ({ id: v.id, name: v.name, language: v.language ?? '', source: v.provider ?? '', notLocked: false, group: 'preset' }))

// The project window's cards, counted from the captured data.
const projectWindowOverview = [
  { section: 'characters', total: charactersData.length, analyzed: Object.keys(characterAnalyses).length },
  { section: 'scenes', total: scenesData.length, analyzed: Object.keys(sceneAnalyses).length },
  { section: 'locations', total: locationsData.length, analyzed: Object.keys(locationAnalyses).length },
]
const projectWindowCategories = ['Characters', 'Scenes', 'Locations', 'Objects', 'Review'].map((label) => ({ value: label.toLowerCase(), label }))

// The provider the captured disclosure is for, so its sheet has a title.
const disclosureProvider = setupData.disclosures.slice(0, 1).map((d) => ({
  id: d.providerId, title: d.title, description: '', connection: 'not-connected', signIn: true, baseUrl: '', setupUrl: '', docsUrl: '', setupInstructions: '',
}))

// SetupConnect's rows: one connected kind, one that needs a key (illustrative).
const connectRows = [
  { kind: { id: 'analysis', title: 'Story analysis', readiness: { ready: true } }, providers: [{ id: 'openrouter', title: 'OpenRouter' }], state: 'connected', next: 'ready', acting: 'openrouter', actingTitle: 'OpenRouter', suggested: { provider: 'openrouter' } },
  { kind: { id: 'voice', title: 'Voices', readiness: { ready: false, reason: 'No voice provider is connected.' } }, providers: [{ id: 'elevenlabs', title: 'ElevenLabs' }], state: 'action', next: 'connect-key', acting: 'elevenlabs', actingTitle: 'ElevenLabs', suggested: { provider: 'elevenlabs' } },
]

const providerRows = providerStatus.slice(0, 5).map((p) => ({
  component: StatusPill,
  props: { text: p.id, tone: p.isReady ? 'success' : 'neutral' },
}))

// The Providers pane's head (khaos-app src/ui/Settings.svelte:168-205): the path
// chooser, and under Advanced the two switches, each with the app's own wording.
const pathRows = (path, { history = false, gitSync = false } = {}) => [
  { component: RadioChoiceList, props: { label: 'Basic or Advanced', value: path, options: pathChoices } },
  ...(path === 'advanced'
    ? [
        { component: Toggle, props: { label: 'Project history', hint: 'Save versions of a project so you can go back. Uses git and Git LFS on this Mac.', checked: history } },
        { component: Toggle, props: { label: 'Git sync', hint: 'Push a project to a Git remote and clone one. Needs project history.', checked: gitSync } },
      ]
    : []),
]

// The local-only preferences khaos-app named in #18 — these touch no engine
// state, which is why they are the writable half of its first Settings slice.
const generalRows = [
  { component: Toggle, props: { label: 'Restore last project', hint: 'Reopens the project you were last in.', checked: true } },
  { component: Toggle, props: { label: 'Start khaosd at login', hint: 'The engine stays running between sessions.', checked: false } },
  { component: Toggle, props: { label: 'Check for updates automatically', checked: true, disabled: true } },
]

// Builder state matrices: the Character Builder workbench and the Composer shot
// tools, one example per state they render. Story content is the B4P capture:
// Madison (characters.json, character-analyses.json) and the "Eviction Notice"
// scene (composition.json, scene-analyses.json); a shot's direction is that
// scene's captured action text. Declared illustrative (D62): ids, review states,
// job records and generation states are a state matrix, never captured, and the
// artwork is the demoFigureFor placeholder. Look options are copied verbatim
// from khaosd's look catalog (khaos-manager internal/characterbuilder,
// look_catalog.go and look_styles.go at 039fd3a3). Appearance direction text is
// authored content with no capture, so the brief stays empty: a gap, reported.
const madison = charactersData.find((c) => c.name === 'Madison')
const madisonAnalysis = characterAnalyses.Madison
const madisonFigure = demoFigureFor({ gender: madisonAnalysis?.demographics?.gender })
const emptyBrief = { identityLock: '', wardrobeLock: '', unknowns: [] }
const madisonWorkspace = {
  characterId: madison?.id ?? '', name: 'Madison', draft: { id: 'madison-draft' },
  preparation: { summary: madisonAnalysis?.summary ?? '', evidence: [] },
  references: [], styleReferences: [], candidates: [], jobs: [],
  hasActiveJobs: false, generationReady: true, generationReason: '',
}
const madisonSheet = (id, name, review, selected) => ({
  canSourceHeadshot: true, selected,
  images: [{ id: `${id}-page`, label: name, imageUrl: madisonFigure }],
  revision: { id, designId: 'madison-main', name, review: { state: review, notes: '' }, pages: [{ purpose: 'characterSheet', referenceId: `${id}-page` }] },
})
const madisonImageURLs = { 'sheet-1-page': madisonFigure, 'sheet-2-page': madisonFigure }
const madisonLook = {
  features: [
    { key: 'form', label: 'Character form', options: ['human-like', 'animal-like', 'creature', 'constructed'], randomizable: false },
    { key: 'texture', label: 'Skin / covering', options: ['smooth bare skin', 'freckled skin', 'textured skin'] },
    { key: 'hairTexture', label: 'Hair texture', options: ['tightly coiled', 'loose curls', 'wavy', 'straight'] },
    { key: 'hair', label: 'Hair / crest', options: ['close-cropped', 'long and worn loose', 'pulled back into a low bun', 'shoulder-length locs'] },
    { key: 'hairColor', label: 'Hair / crest color', options: ['black', 'deep brown', 'auburn', 'copper red'] },
    { key: 'build', label: 'Build', options: ['slender', 'medium build', 'full build'] },
  ],
  choices: { form: 'human-like', texture: 'freckled skin', hairTexture: 'loose curls', hair: 'pulled back into a low bun', hairColor: 'auburn', build: 'medium build' },
}
// Found by slugline, not id: a re-parse of the project re-issues every id.
const evictionSceneId = scenesData.find((s) => s.slugline === 'INT. INDUSTRIAL ARTIST SPACE - DAY')?.id ?? ''
const evictionEvents = compositionData.segments.find((s) => s.sceneId === evictionSceneId)?.events ?? []
const evictionTitle = sceneAnalyses[evictionSceneId]?.title ?? ''
const evictionAction = evictionEvents.find((e) => e.elementType === 'action')
const evictionShot = (frames, chosenId, extra = {}) => ({
  id: 'shot-eviction', title: evictionTitle, direction: evictionAction?.text ?? '', style: 'detailed_pencil',
  framing: 'Wide shot', start: 0, hold: (evictionAction?.durationMs ?? 0) / 1000, timingStatus: 'resolved',
  sourceText: evictionAction?.text ?? '', frames, chosenId, ...extra,
})
const evictionFrames = [
  { id: 'frame-1', url: madisonFigure, imageState: 'ready', review: 'reviewed', canChoose: true },
  { id: 'frame-2', url: madisonFigure, imageState: 'ready', review: 'unreviewed', canChoose: true },
]
const evictionPlan = {
  summary: evictionTitle, warnings: [],
  shots: evictionEvents.slice(0, 3).map((e, i) => ({
    title: `${evictionTitle} ${i + 1}`, intent: '', direction: e.text, framing: ['Wide shot', 'Medium shot', 'Close-up'][i],
    startMs: evictionEvents.slice(0, i).reduce((t, x) => t + (x.durationMs ?? 0), 0), durationMs: e.durationMs ?? 0,
    continuity: '', beatIndices: [], sourceEventIds: [e.elementId], proposals: [],
  })),
}

// The remaining additions since catalog 0.18.0, under the same rule as the
// builder block above. Captured where a capture exists: Desmond's Apartment
// (locations.json, location-analyses.json), the eviction scene's chain and lock
// (its captured action text), the voice languages (voices.json). Refusal and
// unavailable-command text is the engine's and the app's own wording
// (khaos-manager cmd/khaosd/scene_read_views.go:159,196; khaos-app
// src/ui/shell/Shell.svelte:502,511). Counts, ids, review and job states are a
// declared state matrix. Place art is the kit's cover placeholder; object art is
// the figure placeholder. Place and object direction text has no capture, so the
// briefs stay empty: a gap, reported.
const apartment = locationsData.find((l) => l.name === "Desmond's Apartment")
const apartmentAnalysis = locationAnalyses["Desmond's Apartment"]
const emptyPlaceBrief = { spatialDescription: '', fixedFeatures: [], dressing: '', lighting: '', unknowns: [] }
const emptyObjectBrief = { form: '', materials: '', distinguishingDetails: [], state: '', authoredScale: '', unknowns: [] }
const artworkCandidate = (prefix, id, label, review, selected, imageUrl) => ({
  label, selected,
  images: [{ id: `${id}-page`, label, imageUrl }],
  revision: { id, designId: `${prefix}-main`, name: label, createdAt: '2026-10-20T00:00:00Z', review: { state: review, notes: '' }, pages: [{ purpose: 'referenceSheet', referenceId: `${id}-page` }] },
})
const placeWorkspace = {
  locationId: apartment?.id ?? '', name: "Desmond's Apartment", draft: { id: 'apartment-draft' },
  preparation: { summary: apartmentAnalysis?.summary ?? '', atmosphere: typeof apartmentAnalysis?.mood === 'string' ? apartmentAnalysis.mood : '', evidence: [], changes: [] },
  references: [], styleReferences: [], candidates: [], jobs: [], generationReady: true, generationReason: '', hasActiveJobs: false,
}
const objectWorkspace = {
  objectId: 'object-chain-and-lock', name: 'Chain and lock', draft: { id: 'chain-draft' },
  preparation: { summary: evictionAction?.text ?? '', atmosphere: '', evidence: [], changes: [] },
  references: [], styleReferences: [], candidates: [], jobs: [], generationReady: true, generationReason: '', hasActiveJobs: false,
}
const objectFigure = demoFigureFor({})
const artworkStates = (workspace, brief, prefix, imageUrl) => [
  { label: 'Direction for a captured subject', props: { workspace, brief } },
  { label: 'Generating', props: { workspace: { ...workspace, hasActiveJobs: true, jobs: [{ id: `${prefix}-job-1`, requestId: `${prefix}-request-1`, state: 'running', publication: 'pending', revisionId: '', error: '' }] }, brief, generationRequestId: `${prefix}-request-1`, busy: true } },
  { label: 'Version ready to review', props: { workspace: { ...workspace, candidates: [artworkCandidate(prefix, `${prefix}-2`, 'Version 2', 'unreviewed', false, imageUrl), artworkCandidate(prefix, `${prefix}-1`, 'Version 1', 'reviewed', true, imageUrl)], jobs: [{ id: `${prefix}-job-2`, requestId: `${prefix}-request-2`, state: 'succeeded', publication: 'saved', revisionId: `${prefix}-2`, error: '' }] }, brief, candidateId: `${prefix}-1`, generationRequestId: `${prefix}-request-2`, imageURLs: { [`${prefix}-1-page`]: imageUrl, [`${prefix}-2-page`]: imageUrl }, mediaUrl: imageUrl } },
  { label: 'Unsaved direction', props: { workspace: { ...workspace, candidates: [artworkCandidate(prefix, `${prefix}-1`, 'Version 1', 'reviewed', true, imageUrl)] }, brief, candidateId: `${prefix}-1`, imageURLs: { [`${prefix}-1-page`]: imageUrl }, mediaUrl: imageUrl, dirty: true } },
  { label: 'Not ready to generate', props: { workspace: { ...workspace, generationReady: false }, brief } },
]
const voiceLanguages = [...new Set(voicesData.map((v) => v.language).filter(Boolean))]
const sceneWorkflow = (state, counts, resume) => ({ id: `workflow-${state}`, state, counts, resume })
const unavailableCommands = [
  ...paletteCommands,
  { id: 'place.new', label: 'New Place', group: 'Place', icon: 'map-pin', disabledReason: 'The story is being written' },
  { id: 'character.new', label: 'New Character', group: 'Character', icon: 'user-plus', disabledReason: 'A character is being written' },
]

// The fixture registry — one entry per component the library exports. (It used
// to say "one entry per fixture in ../fixtures/"; there is no such directory
// and there has not been one for some time.) Each entry carries `examples`: a
// populated state and an empty state, so the catalog demonstrates both, not
// just the happy path.
//
// `npm run check-catalog` fails if an export has no entry here. This is the
// library's only component surface (D61) — where a component is exercised on a
// real device against real data — so an export missing from here cannot be
// playtested at all, and its `section`/`group` must be one the registry below
// declares and labels (`npm run check-taxonomy`).

// Keep in sync with src-tauri/tauri.conf.json (and Cargo.toml) on release.
// version.test.js asserts all three agree — the sidebar reads this constant, so
// a forgotten bump ships a build that misreports itself.
export const APP_VERSION = '0.20.0'

// The engine plate's real component list, from a captured `/api/health`.
//
// This replaces a hand-maintained `DAEMON_VERSION` constant that had gone stale
// twice in one day — 0.4.11 while the daemon ran 0.6.1, then 0.6.1 while it ran
// 0.6.5. A constant nobody fetches is only ever as current as the last person to
// notice, which is not a property worth keeping when the daemon will tell us.
//
// It also stops the catalog demonstrating the WRONG path. The engine plate (EngineDetails)
// takes an `engine.components` list (#17) and maps the three legacy fields onto it for
// backwards compatibility; the fixture once fed it the legacy shape, so the only thing on
// display was the compatibility path.
//
// `{ name, version }` where a version exists, `{ name, status }` where it does
// not — which is the component's own contract for the difference. Every tool
// reports a semver as of khaosd 0.6.5; `git` and `ollama` were presence-only
// when #17 was written, so the status branch is no longer exercised by the real
// payload and is kept honest by the fixture below rather than by accident.
const engineComponents = [
  { name: 'Catalog', version: APP_VERSION },
  { name: 'khaosd', version: engineData.daemonVersion },
  ...engineData.tools.map((t) =>
    t.semver ? { name: t.id, version: t.semver } : { name: t.id, status: t.available ? 'present' : '—' },
  ),
]

// THE UPDATE VERDICTS, which the plate could render since #151 and which no
// fixture exercised — so the catalog demonstrated the plate with every verdict
// absent, and #156 was found in khaos-app's window instead of in this one. A
// prop branch with no fixture is a branch the catalog passes over; that is the
// same shape as #109's tri-state note above.
//
// PROVENANCE: the four labels are khaos-app's own, measured against a running
// khaosd and reported on #156 with their character counts. Same basis as the
// `routes` fixture below — real strings from a real daemon relayed by the lead
// who measured them, which is D62's illustrative exception with its second
// condition met. Nothing here is invented wording.
//
// The point of the pairing: rows 1-2 are what a host ships TODAY, label-only,
// and the long one is the case that eats the row. Rows 3-4 pass `detail`, so
// the label can be a word while the full verdict stays the accessible name and
// the hover text. Read them together to see what `detail` buys.
const engineComponentsWithVerdicts = [
  { name: 'Catalog', version: APP_VERSION, update: { label: 'Up to date', tone: 'success' } },
  {
    name: 'khaosd',
    version: engineData.daemonVersion,
    // 36 characters against a 177px plate. No `detail`, so this is the state
    // #156 reported: the badge cannot shrink, so the VERSION disappears.
    update: { label: 'Version 0.24.1 could not be compared', tone: 'neutral' },
  },
  {
    name: 'khaos-tools',
    version: '0.24.1',
    update: { label: 'Behind', tone: 'warning', detail: 'Update available — 0.19.0' },
  },
  {
    name: 'khaos-wfl',
    version: '0.9.0',
    update: { label: 'Unlisted', tone: 'neutral', detail: 'Not in the update feed' },
  },
]

// MetaStrip's run is the metadata under a player's stage, so its values are
// read out of the same capture StoryPlayer's fixture plays: the first scene of
// the composition, the character who speaks in it, and a transport readout at
// the 44s mark StoryPlayer's "Playing" example sits at. Nothing here is typed
// in by hand — the real-data rule, and D62's illustrative exception does not
// reach it (that is scoped to state matrices; this is content).
const openingSegment = compositionData.segments[0]
// `?.` because a segment that opens on action carries no speaker. `text` is a
// required string, so an absent one would feed `undefined` into it and render
// an empty item — the capture's gap, silently wearing the component's face.
// Today's capture yields MADISON; `metaItems` below drops the row instead if a
// future capture does not, which reports the gap by omission rather than
// papering over it with invented prose.
const openingSpeaker = openingSegment.events.find((e) => e.characterName)?.characterName

/** Drops any MetaStrip item whose text the capture did not supply. */
const metaItems = (...items) => items.filter((i) => i.text)
const storyDuration = compositionData.segments.reduce((total, s) => total + (s.durationMs ?? 0) / 1000, 0)

/** `h:mm:ss`, or `m:ss` under an hour — what a transport readout shows. */
const timecode = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const pad = (n) => String(n).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

// A captured scene read (data/scene-read.json) as StoryPlayer takes it: one scene segment,
// one event per line, each carrying the engine's startMs and durationMs.
const peakSeconds = (peaks) => (peaks.length * peaks.samples_per_pixel) / peaks.sample_rate
const readLines = sceneReadData.read.lines
const readEndMs = readLines.at(-1).startMs + readLines.at(-1).durationMs
const readSeconds = readEndMs / 1000
const sceneReadSegment = {
  kind: 'scene', sceneId: sceneReadData.read.sceneId, label: sceneReadData.sceneHeading, startMs: 0, durationMs: readEndMs,
  events: readLines.map((l) => ({ elementType: l.elementType, elementId: l.eventId, startMs: l.startMs, durationMs: l.durationMs, text: l.text })),
}

// The launcher with its engine and routing ready. Shared by every example so
// they differ only in their stories and their setup path.
const welcomeReady = {
  engine: { state: 'ready', components: engineComponents },
  routes: [{ capability: 'analysis.text', label: 'Analysis', provider: 'openrouter', model: 'deepseek/deepseek-v4.1-flash' }],
}

const welcomeProjects = [
  { id: 'pending', title: 'Brick & Steel', path: '/Users/k/khaos/projects/brick.kspd' },
  { id: 's1', title: 'BROKEN IN 4 PLACES', path: '/Users/k/khaos/projects/b4p.kspd', scene_count: scenesData.length, character_count: charactersData.length, location_count: locationsData.length, package_stage: 'indexed', git_repo: true },
  { id: 's2', title: 'Heart of an Indie', path: '/Users/k/khaos/projects/heart.kspd', scene_count: 5, character_count: 4, location_count: 3, package_stage: 'parsed' },
]
const welcomeJobFor = (p) => (p.id === 'pending' ? { kind: 'import', phase: 'running', elapsedMs: 65000 } : undefined)
const welcomeHandlers = { onImport: () => {}, onOpen: () => {}, onSettings: () => {}, onRefresh: () => {}, onOpenProject: () => {}, onExtractProject: () => {}, onRemoveProject: () => {} }
// What the setup path changes on the launcher, as Khaos App passes it
// (khaos-app src/ui/App.svelte:975-1003): the on-device engines only on
// Advanced, Clone only with Git sync, and initialising a project's history only
// with Project history. On-device engines are khaosd's captured services.
const welcomeFor = (path, { history = false, gitSync = false } = {}) => ({
  ...(path === 'advanced' ? { services: servicesData } : {}),
  clone: gitSync,
  ...(gitSync ? { onClone: () => {} } : {}),
  ...(history ? { onInitGit: () => {} } : {}),
})

// T1's shared panes (catalog app-coverage plan). Stale reasons are khaosd's, captured
// in staleness.json; the playback event is the eviction scene's first line from
// composition.json. A provider's failure diagnostic and image bytes have no capture,
// so those two are declared illustrative (D62): their shapes are khaosd's, their
// values are not measurements.
const staleCharacter = stalenessData.characters.find((c) => c.state === 'stale')
const evictionSegment = compositionData.segments.find((s) => s.sceneId === evictionSceneId)
const evictionLine = evictionSegment?.events.find((e) => e.elementType === 'dialogue')
const evictionSpeaker = charactersData.find((c) => c.id === evictionLine?.characterId)
const evictionPlayback = (audio) => ({ kind: 'scene', timing: audio ? 'read' : 'estimated', reads: audio ? [{ id: 'read-1', chosen: true }] : [], audio })
const namedPlace = locationsData.find((l) => l.mentionedSceneIds?.length) ?? null
const madisonLine = (() => {
  const d = dialoguesData.find((x) => x.character === 'Madison') ?? dialoguesData[0]
  return { element_id: d.element_id, text: d.text, parenthetical: d.parenthetical, scene_id: d.scene_id, scene_slugline: d.scene_slugline }
})()
const sceneReadTakes = sceneReadData.take ? [{ id: sceneReadData.take.id, label: sceneReadData.take.label, voiceName: '' }] : []
const illustrativeFailure = {
  id: 'gen_illustrative',
  error: 'the provider refused the request',
  provider: { provider: 'gemini', model: 'gemini-tts', profile: 'default' },
  providerDiagnostic: { operation: 'synthesize', httpStatus: 429, message: 'Resource has been exhausted', requestId: 'req_illustrative', truncated: false, expiresAt: '2026-10-28T00:00:00Z', responseBody: '{"error":{"code":429,"status":"RESOURCE_EXHAUSTED"}}' },
}

// The Characters destination's panes (catalog app-coverage plan, T2), on Madison as khaosd
// serves her (characters-destination.json): her row, her analysis, her recordings and her
// mentions, verbatim. Only the stranded mentions are illustrative: khaosd answers them when an
// alias is removed, and a capture would have to remove one. They are built from her captured
// "Madi" lines, so the words are the script's.
const madisonRow = charactersDestination.characters.find((c) => c.id === charactersDestination.focus.id)
const madisonMentions = charactersDestination.focus.mentions
const madiLines = (madisonMentions.find((m) => m.wording === 'Madi')?.occurrences ?? []).slice(0, 3)
const madisonCast = castingData.find((c) => c.characterId === madisonRow?.id)
const castableVoices = castingData.map((c) => ({ profileId: c.voiceProfileId, name: c.voiceProfileName }))
const castReadiness = Object.fromEntries([
  [NARRATOR, { state: 'missing', label: 'No narrator voice selected' }],
  ...charactersDestination.characters.map((c) => {
    const cast = castingData.find((k) => k.characterId === c.id)
    return [c.id, cast ? { state: 'ready', label: cast.voiceProfileName } : { state: 'missing', label: 'No voice assigned' }]
  }),
])
const characterStandings = Object.fromEntries(stalenessData.characters.map((c) => [c.entity_id, { state: c.state }]))
const storyScenes = scenesData.map((sc) => ({ id: sc.id, index: sc.number - 1, slugline: sc.slugline }))
const madisonDetail = {
  character: madisonRow,
  scenes: storyScenes,
  dialogues: { kind: 'loaded', lines: dialoguesData.filter((l) => l.character === 'Madison') },
  detail: { kind: 'loaded', analysis: charactersDestination.focus.analysis },
  standing: stalenessData.characters.find((c) => c.entity_id === madisonRow?.id),
  images: { kind: 'loaded', rows: [{ referenceId: 'ref-front', label: 'Front' }] },
  imageUrls: { 'ref-front': madisonFigure },
  recordings: { kind: 'loaded', recordings: charactersDestination.focus.recordings },
  portrait: madisonFigure,
  onBuildAppearance: () => {},
}
// The engine's voice briefs for Madison and the narrator, captured from khaosd (voice-briefs.json).
const madisonBrief = /** @type {const} */ ({ kind: 'ready', brief: voiceBriefs.madison })
const narratorBrief = /** @type {const} */ ({ kind: 'ready', brief: voiceBriefs.narrator })
const madisonSide = {
  character: madisonRow,
  portrait: madisonFigure,
  castable: castableVoices,
  castLabel: madisonCast?.voiceProfileName ?? 'Not cast',
  cast: Boolean(madisonCast),
  characters: charactersDestination.characters,
  mentions: { kind: 'loaded', mentions: madisonMentions },
  graphContext: charactersDestination.focus.graphContext,
  deletable: false,
  onCast: () => {}, onDesignVoice: () => {}, onAddAlias: () => {}, onRemoveAlias: () => {}, onSelectMention: () => {},
}
const characterPanes = [
  {
    id: 'character-analysis', name: 'CharacterAnalysis', kind: 'component', section: 'screens', group: 'characters', component: CharacterAnalysis,
    examples: [
      { label: 'Madison (captured)', props: { analysis: charactersDestination.focus.analysis } },
      { label: 'Empty', props: { analysis: { story: {}, casting: {} } } },
    ],
  },
  {
    id: 'character-recordings', name: 'CharacterRecordings', kind: 'component', section: 'screens', group: 'characters', component: CharacterRecordings,
    examples: [
      { label: 'Madison (captured)', props: { read: { kind: 'loaded', recordings: charactersDestination.focus.recordings }, characterName: 'Madison', onRevealRecording: () => {} } },
      { label: 'Reading', props: { read: { kind: 'loading' }, characterName: 'Madison' } },
      { label: 'Read failed', props: { read: { kind: 'failed', message: 'NOT_FOUND: character not in project' }, characterName: 'Madison' } },
      { label: 'Empty', props: { read: { kind: 'loaded', recordings: [] }, characterName: 'Madison' } },
    ],
  },
  {
    id: 'character-mentions', name: 'CharacterMentions', kind: 'component', section: 'screens', group: 'characters', component: CharacterMentions,
    examples: [
      { label: 'Madison (captured)', props: { read: { kind: 'loaded', mentions: madisonMentions }, characterName: 'Madison', selected: madisonMentions[0]?.wording ?? null, onselect: () => {} } },
      { label: 'Reading', props: { read: { kind: 'loading' }, characterName: 'Madison' } },
      { label: 'Read failed', props: { read: { kind: 'failed', message: 'NOT_FOUND: no such package' }, characterName: 'Madison' } },
      { label: 'Empty', props: { read: { kind: 'loaded', mentions: [] }, characterName: 'Madison' } },
    ],
  },
  {
    id: 'character-aliases', name: 'CharacterAliases', kind: 'component', section: 'screens', group: 'characters', component: CharacterAliases,
    examples: [
      { label: 'Madison (captured)', props: { character: madisonRow, characters: charactersDestination.characters } },
      { label: 'Removed alias (illustrative)', props: {
        character: madisonRow, characters: charactersDestination.characters,
        stranded: { characterId: madisonRow?.id ?? '', characterName: madisonRow?.name ?? '', alias: 'Madi', mentions: madiLines.map((l) => ({ id: l.referenceId, name: 'Madi', sceneId: l.sceneId, lineNumber: l.lineNumber, lineText: l.lineText })) },
        sceneNumber: (id) => scenesData.find((sc) => sc.id === id)?.number ?? null,
      } },
      { label: 'Writing', props: { character: madisonRow, characters: charactersDestination.characters, busy: true } },
      { label: 'Empty', props: { character: { id: 'character_empty', name: 'ALMA' } } },
    ],
  },
  {
    // The captured rows, cast (casting.json) and analysis standings (staleness.json). Voice
    // readiness needs the voices' lock state, which has no capture: a cast voice reads as ready
    // there, illustratively. Madison's headshot is the illustrative figure (D62).
    id: 'character-table', name: 'CharacterTable', kind: 'component', section: 'screens', group: 'characters', component: CharacterTable,
    examples: [
      { label: 'Cast and standings (captured)', props: { characters: charactersDestination.characters, castings: castingData, narratorCast: 'Not set', readiness: castReadiness, standings: characterStandings, onselect: () => {} } },
      { label: 'Selected, with appearance (illustrative)', props: {
        characters: charactersDestination.characters, castings: castingData, narratorCast: 'Not set', readiness: castReadiness, standings: characterStandings,
        appearance: { [madisonRow?.id ?? '']: 'portrait' }, portraits: { [madisonRow?.id ?? '']: madisonFigure }, selected: madisonRow?.id ?? '', onselect: () => {},
      } },
      { label: 'Reading the cast', props: { characters: charactersDestination.characters, castings: null } },
      { label: 'Empty', props: { characters: [], castings: [] } },
      { label: 'Reading', props: { characters: [], castings: [], status: { kind: 'loading' } } },
      // khaos-app: a failed story read (ATLAS_READ_FAILED on Brick & Steel) once read as an empty story. The message is illustrative.
      { label: 'Read failed (illustrative message)', props: { characters: [], castings: [], status: { kind: 'failed', message: 'Khaos couldn’t read this story.' }, onretry: () => {} } },
    ],
  },
  {
    // Madison's captured lines (dialogues.json), scenes, analysis, recordings and mention lines.
    // Images have no capture: the illustrative figure stands in (D62).
    id: 'character-detail', name: 'CharacterDetail', kind: 'component', section: 'screens', group: 'characters', component: CharacterDetail,
    examples: [
      { label: 'Madison (captured)', props: { ...madisonDetail, onSelectLine: () => {}, onview: () => {} } },
      { label: 'Mention chosen', props: { ...madisonDetail, mention: madisonMentions[0] ?? null, onClearMention: () => {} } },
      { label: 'Reading the lines', props: { ...madisonDetail, dialogues: { kind: 'loading' } } },
      { label: 'Not analysed yet', props: { ...madisonDetail, detail: { kind: 'idle' } } },
      { label: 'Empty', props: { character: null } },
    ],
  },
  {
    // What a voice is designed from (khaos-manager internal/api/voice_brief.go), captured from khaosd.
    id: 'voice-brief', name: 'VoiceBrief', kind: 'component', section: 'screens', group: 'characters', component: VoiceBrief,
    examples: [
      { label: 'Madison (captured)', props: { name: 'Madison', read: madisonBrief } },
      { label: 'Narrator (captured)', props: { name: 'Narrator', read: narratorBrief } },
      { label: 'In the voice studio: the rest of the brief', props: { name: 'Madison', read: madisonBrief, description: false, linesFrom: 1 } },
      { label: 'The story gives no genre or premise (illustrative)', props: { name: 'Narrator', read: { kind: 'ready', brief: { ...voiceBriefs.narrator, gaps: ['genre', 'premise'] } } } },
      { label: 'No lines (POP, captured)', props: { name: 'POP', read: { kind: 'ready', brief: { speaks: false, description: '', auditionLines: [], suggested: [] } } } },
      { label: 'Reading', props: { name: 'Madison', read: { kind: 'loading' } } },
      { label: 'Could not read (illustrative message)', props: { name: 'Madison', read: { kind: 'failed', message: "Madison hasn't been analysed yet. Choose Analyse Character." } } },
      { label: 'Empty', props: { name: 'Madison', read: { kind: 'ready', brief: { speaks: true, description: '', auditionLines: [], suggested: [] } } } },
    ],
  },
  {
    // Madison's captured row, cast, mentions and co-appearances. The castable voices are the
    // project's cast voices (casting.json); the line selected is DialogueInspector's fixture.
    id: 'character-side', name: 'CharacterSide', kind: 'component', section: 'screens', group: 'characters', component: CharacterSide,
    examples: [
      { label: 'Madison (captured)', props: { ...madisonSide } },
      { label: 'Voice not locked (illustrative)', props: { ...madisonSide, castUnlocked: { name: madisonCast?.voiceProfileName ?? 'Madison', profileId: madisonCast?.voiceProfileId ?? '' } } },
      { label: 'Narrator', props: { narrator: true, castable: castableVoices, narratorLabel: 'Not set', onCast: () => {}, onDesignVoice: () => {} } },
      { label: 'Madison, with her voice brief (captured)', props: { ...madisonSide, voiceBrief: madisonBrief } },
      { label: 'Narrator, with its voice brief (captured)', props: { narrator: true, castable: castableVoices, narratorLabel: 'Not set', onCast: () => {}, onDesignVoice: () => {}, voiceBrief: narratorBrief } },
      // khaos-app#620: the narrator's voice heard in place. The clip is the catalog's bundled
      // audition sample (public/samples/), standing in for a preview khaosd makes; illustrative.
      { label: 'Narrator, preview offered (illustrative)', props: { narrator: true, castable: castableVoices, narratorLabel: 'Ava', narratorPreview: { kind: 'none' }, onPreviewNarrator: () => {}, onCast: () => {}, onDesignVoice: () => {} } },
      { label: 'Narrator, preview playing (illustrative clip)', props: { narrator: true, castable: castableVoices, narratorLabel: 'Ava', narratorPreview: { kind: 'ready', src: '/samples/neutral.m4a' }, onCast: () => {}, onDesignVoice: () => {} } },
      { label: 'A line selected', props: { ...madisonSide },
        snippets: { dialogue: [{ component: DialogueInspector, props: { line: madisonLine, speaker: 'Madison', takesOffered: true, takes: illustrativeTakes } }] } },
      { label: 'Empty', props: { character: null } },
    ],
  },
]

// The Scenes destination's panes (catalog app-coverage plan, T3), on the first scene, "Eviction
// Notice", as khaosd serves it (scenes-destination.json, composition.json, staleness.json): its
// row, text, analysis and standing, and the places and objects its accounts name. The read
// timeline, the line inspector and the reads are those panes' own fixtures, passed as snippets.
// The one captured read (scene-read.json) is of another scene, so the examples that show it say so.
const sceneRecords = scenesDestination.scenes
const evictionRecord = sceneRecords.find((s) => s.id === scenesDestination.focus.id) ?? null
const sceneStandings = Object.fromEntries(stalenessData.scenes.map((s) => [s.scene_id, { state: s.state, reasons: s.reasons, details: s.details }]))
const staleSceneId = stalenessData.scenes.find((s) => s.state === 'stale')?.scene_id ?? ''
const storyNames = [...charactersDestination.characters, ...scenesDestination.objects, ...scenesDestination.locations]
const sceneLists = { characters: charactersDestination.characters, locations: scenesDestination.locations, objects: scenesDestination.objects }
const evictionDetail = {
  scene: evictionRecord,
  segment: evictionSegment ?? null,
  analysis: scenesDestination.focus.analysis,
  names: storyNames,
  standing: sceneStandings[scenesDestination.focus.id],
  onselectline: () => {},
}
const scenePanes = [
  {
    id: 'scene-table', name: 'SceneTable', kind: 'component', section: 'screens', group: 'scenes', component: SceneTable,
    examples: [
      { label: 'Scenes and standings (captured)', props: { scenes: sceneRecords, standings: sceneStandings, onselect: () => {} } },
      { label: 'Selected, a read just made', props: { scenes: sceneRecords, standings: sceneStandings, selected: staleSceneId, reads: { [staleSceneId]: 1 }, onselect: () => {} } },
      { label: 'Empty', props: { scenes: [] } },
      { label: 'Reading', props: { scenes: [], status: { kind: 'loading' } } },
      // khaos-app: a failed story read (ATLAS_READ_FAILED on Brick & Steel) once read as an empty story. The message is illustrative.
      { label: 'Read failed (illustrative message)', props: { scenes: [], status: { kind: 'failed', message: 'Khaos couldn’t read this story.' }, onretry: () => {} } },
    ],
  },
  {
    id: 'scene-analysis', name: 'SceneAnalysis', kind: 'component', section: 'screens', group: 'scenes', component: SceneAnalysis,
    examples: [
      { label: 'Eviction Notice (captured)', props: { analysis: scenesDestination.focus.analysis, names: storyNames, events: evictionSegment?.events ?? [], standing: sceneStandings[scenesDestination.focus.id] } },
      { label: 'Stale (captured standing)', props: { analysis: scenesDestination.focus.analysis, names: storyNames, events: evictionSegment?.events ?? [], standing: sceneStandings[staleSceneId] } },
      { label: 'Refused (illustrative)', props: { analysis: null, standing: { state: 'none', refusal: 'scene 2 is not analysed: the nth scene process is not approved; scene analysis stops after scene 1' } } },
      { label: 'Empty', props: { analysis: null } },
    ],
  },
  {
    id: 'scene-detail', name: 'SceneDetail', kind: 'component', section: 'screens', group: 'scenes', component: SceneDetail,
    examples: [
      { label: 'Eviction Notice (captured)', props: { ...evictionDetail, selectedLine: evictionLine?.elementId ?? '' } },
      { label: "A read open (another scene's captured read)", props: { ...evictionDetail, readOpen: true, readOpening: true },
        snippets: { read: [{ component: ReadTimeline, props: { state: { kind: 'loaded' }, segments: [sceneReadSegment], peaks: sceneReadData.readPeaks ?? null, currentTime: 0, selectedElementId: readLines[0]?.eventId ?? '' } }] } },
      { label: 'No composition', props: { ...evictionDetail, segment: null, sceneText: { kind: 'text', text: evictionEvents.map((e) => e.text ?? '').join('\n\n') } } },
      { label: 'Reading the text', props: { ...evictionDetail, segment: null, sceneText: { kind: 'loading' } } },
      { label: 'Empty', props: { scene: null } },
    ],
  },
  {
    id: 'scene-side', name: 'SceneSide', kind: 'component', section: 'screens', group: 'scenes', component: SceneSide,
    examples: [
      { label: "With reads (another scene's captured read)", props: { scene: evictionRecord, ...sceneLists },
        snippets: { reads: [{ component: SceneReads, props: { sceneHeading: sceneReadData.sceneHeading, takes: sceneReadTakes, chosenId: sceneReadTakes[0]?.id ?? '', canDownload: true, narrator: { status: 'usable' }, skipped: [] } }] } },
      { label: 'Eviction Notice (captured)', props: { scene: evictionRecord, ...sceneLists } },
      { label: 'A line selected', props: { scene: evictionRecord, ...sceneLists },
        snippets: { line: [{ component: LineInspector, props: { event: evictionAction ? { elementType: 'action', text: evictionAction.text } : null, backLabel: 'Back to the scene' } }] } },
      { label: 'Empty', props: { scene: null } },
    ],
  },
]

// The Places and Objects destinations' panes (catalog app-coverage plan, T4), on Broken in 4
// Places as khaosd serves it: the place and object rows (scenes-destination.json), and for the
// place with the most scenes its analysis, graph context and the project's headings
// (places-destination.json). The project has no heading decisions yet, so the merge and
// kept-apart examples are built from its captured headings, and say so; designs have no
// capture and use the illustrative figures the workbench fixtures use (D62).
const placeRecords = scenesDestination.locations
const objectRecords = scenesDestination.objects
const focusPlace = placeRecords.find((p) => p.id === placesDestination.focus.id) ?? null
const placeStandings = Object.fromEntries(stalenessData.locations.map((l) => [l.entity_id, { state: l.state, reasons: l.reasons, details: l.details }]))
const placeHeadings = placesDestination.headings
const focusHeadings = placeHeadings.occurrences.filter((o) => o.locationId === placesDestination.focus.id)
const otherHeadings = placeHeadings.occurrences.filter((o) => o.locationId !== placesDestination.focus.id)
const headingDecision = (state, seq, canonical, retired) => ({
  state, decisionSeq: seq, inEffect: true, sourceHash: canonical.sourceHash,
  canonicalId: canonical.locationId, retiredId: retired.locationId,
  canonical: canonical.evidence, retired: retired.evidence,
})
const decidedHeadings = focusHeadings[0] && otherHeadings[1] ? {
  sourceHash: placeHeadings.sourceHash,
  occurrences: placeHeadings.occurrences,
  decisions: [
    headingDecision('merged', 1, focusHeadings[0], otherHeadings[0]),
    headingDecision('declaredDifferent', 2, focusHeadings[0], otherHeadings[1]),
  ],
} : placeHeadings
// The story-wide analyses (khaos.machine docs/designs/2026-10-24-stage3-analysis-display.md, item 4),
// b4p's, verbatim. Filed under drafts until Khaos App renders the Overview.
// Readiness variants on b4p's answer: one refused scene, and two voices needing attention.
const readinessRefused = { ...readingReadiness, scenes: [{ ...readingReadiness.scenes[0], ready: false, refusal: 'character_01M5MJB4BP has no locked voice', lines: 0, newHosted: 0 }, ...readingReadiness.scenes.slice(1)], totals: { ...readingReadiness.totals, ready: readingReadiness.totals.ready - 1, refused: 1 } }
const readinessVoices = { ...readingReadiness, voices: readingReadiness.voices.map((v, i) => (i === 0 ? { ...v, locked: false } : i === 1 ? { ...v, providerAvailable: false, problem: 'the speech provider is not set up' } : v)) }
const structureBase = {
  presets: [{ value: 'studio', label: 'Studio' }, { value: '1br1ba', label: '1 bed, 1 bath' }, { value: '2br1ba', label: '2 bed, 1 bath' }, { value: '3br2ba', label: '3 bed, 2 bath' }],
  places: ['apartment', 'brownstone', 'house'],
  kinds: ['living', 'dining', 'kitchen', 'bathroom', 'bedroom', 'room', 'hall', 'closet', 'stoop', 'sidewalk', 'street', 'balcony'],
}
const structureAreas = placeBuilderStates.preparation.areas.map((a, i) => ({ id: `area-${i}`, label: a.name }))
// khaosd's own blocks and messages (internal/api/casting_voice.go, khaos-manager#1091).
const readinessModel = { id: 'qwen3-tts-1.7b', name: 'Qwen3 TTS 1.7B', repoId: 'Qwen/Qwen3-TTS-1.7B' }
const readinessBlocked = {
  ...readingReadiness,
  voices: readingReadiness.voices.map((v, i) =>
    i === 0 ? { ...v, blocked: { code: 'VOICE_ENGINE_NOT_ENABLED', message: 'kitten is not enabled in Settings › Routing › Speech Generation; cast a voice on the configured engine' } }
    : i === 1 ? { ...v, blocked: { code: 'MODELS_MISSING', message: `not downloaded on this Mac: ${readinessModel.name}; download in Settings › On-device engines`, models: [readinessModel] } }
    : v),
  modelsMissing: [readinessModel],
}
const overviewPreflight = storyOverview['story-analysis/preflight']
const overviewReads = {
  premise: { kind: 'loaded', data: storyOverview.premise.premise },
  structure: { kind: 'loaded', data: storyOverview.structure },
  coverage: { kind: 'loaded', data: storyOverview['coverage/report'] },
}
const { names: _unnamedTurns, ...overviewUnnamed } = storyOverview.structure
const overviewStrip = {
  coverage: { verdict: storyOverview['coverage/report'].rubric.verdict.value },
  budget: { kind: 'loaded', usd: '10.00', spentUsd: '3.20', remainingUsd: '6.80' },
  review: 7,
  next: { label: 'Find relationships', icon: 'sparkle' },
}

const focusPlaceDetail = {
  place: focusPlace,
  detail: { kind: 'loaded', analysis: placesDestination.focus.analysis, graphContext: placesDestination.focus.graphContext },
  standing: placeStandings[placesDestination.focus.id],
  headings: { kind: 'loaded', read: placeHeadings },
  images: { kind: 'loaded', rows: [] },
  onview: () => {},
}
const groupObject = objectRecords.find((o) => o.identityKind === 'group' && o.members?.length) ?? objectRecords[0] ?? null
const placeDirection = { spatialDescription: 'A narrow one-bedroom over a corner store: a galley kitchen, a couch facing the window, a door to the fire escape.', lighting: 'Street light through blinds', fixedFeatures: ['fire escape', 'galley kitchen'] }
const objectDirection = { form: 'A canvas tote holding three paint tins and brushes.', materials: 'canvas, tin', distinguishingDetails: ['paint-spattered handles'] }
const identitySnippet = (kind, item) => ({ identity: [{ component: IdentitySide, props: { kind, item, named: [], deletable: false } }] })
const placePanes = [
  {
    id: 'place-table', name: 'PlaceTable', kind: 'component', section: 'screens', group: 'places', component: PlaceTable,
    examples: [
      { label: 'Places and standings (captured)', props: { places: placeRecords, standings: placeStandings, selected: placesDestination.focus.id, onselect: () => {} } },
      { label: 'Empty', props: { places: [] } },
      { label: 'Reading', props: { places: [], status: { kind: 'loading' } } },
      // khaos-app: a failed story read (ATLAS_READ_FAILED on Brick & Steel) once read as an empty story. The message is illustrative.
      { label: 'Read failed (illustrative message)', props: { places: [], status: { kind: 'failed', message: 'Khaos couldn’t read this story.' }, onretry: () => {} } },
    ],
  },
  {
    id: 'place-analysis', name: 'PlaceAnalysis', kind: 'component', section: 'screens', group: 'places', component: PlaceAnalysis,
    examples: [
      { label: `${focusPlace?.name ?? 'Place'} (captured)`, props: { analysis: placesDestination.focus.analysis } },
      { label: 'Empty', props: { analysis: { story: {}, setting: {} } } },
    ],
  },
  {
    id: 'location-headings', name: 'LocationHeadings', kind: 'component', section: 'screens', group: 'places', component: LocationHeadings,
    examples: [
      { label: 'Headings (captured)', props: { read: { kind: 'loaded', read: placeHeadings }, locationId: placesDestination.focus.id, onSplit: () => true, onKeepApart: () => true } },
      { label: 'Merged and kept apart (illustrative decisions)', props: { read: { kind: 'loaded', read: decidedHeadings }, locationId: placesDestination.focus.id, onSplit: () => true, onKeepApart: () => true } },
      { label: 'Writing', props: { read: { kind: 'loaded', read: decidedHeadings }, locationId: placesDestination.focus.id, busy: true } },
      { label: 'Read failed', props: { read: { kind: 'failed', message: 'NOT_FOUND: no such package' } } },
      { label: 'Empty', props: { read: { kind: 'loaded', read: { occurrences: [], decisions: [] } }, locationId: placesDestination.focus.id } },
    ],
  },
  {
    id: 'place-detail', name: 'PlaceDetail', kind: 'component', section: 'screens', group: 'places', component: PlaceDetail,
    examples: [
      { label: `${focusPlace?.name ?? 'Place'} (captured)`, props: focusPlaceDetail },
      { label: 'Reading the analysis', props: { ...focusPlaceDetail, detail: { kind: 'loading' } } },
      { label: 'Not analysed yet', props: { ...focusPlaceDetail, detail: { kind: 'idle' } } },
      { label: `${placeBuilderStates.name}: areas (captured)`, props: { place: { id: 'location_01M5MJB4BPSTAAFR77ADHVD4SF', name: placeBuilderStates.name }, areas: { kind: 'loaded', areas: placeBuilderStates.preparation.areas } } },
      { label: 'Empty', props: { place: null } },
    ],
  },
  {
    id: 'story-overview', name: 'StoryOverview', kind: 'component', section: 'screens', group: 'drafts', component: StoryOverview,
    examples: [
      { label: 'B4P (captured)', props: { title: 'B4P', ...overviewReads, onselect: () => {} } },
      { label: 'B4P, Advanced (captured)', props: { title: 'B4P', ...overviewReads, advanced: true, onselect: () => {} } },
      { label: 'A turn selected (captured)', props: { title: 'B4P', ...overviewReads, selected: { kind: 'turn', index: 0 }, onselect: () => {} } },
      { label: 'Turns not named yet (captured, names removed)', props: { title: 'B4P', ...overviewReads, structure: { kind: 'loaded', data: overviewUnnamed } } },
      { label: 'Nothing made yet', props: { title: 'B4P', premise: { kind: 'missing' }, structure: { kind: 'missing' }, coverage: { kind: 'missing' } } },
      { label: 'Reading', props: { title: 'B4P' } },
      { label: 'Coverage not read (illustrative error)', props: { title: 'B4P', ...overviewReads, coverage: { kind: 'failed', message: 'COVERAGE_READ_FAILED: the report could not be parsed' } } },
      // Run actions. ILLUSTRATIVE (D62/D74): each `maxCalls` is b4p's captured preflight (3 per pass);
      // the run states themselves are shapes the capture cannot reach.
      { label: 'Run: Measure the shape (free)', props: { title: 'B4P', premise: { kind: 'missing' }, structure: { kind: 'missing' }, coverage: { kind: 'missing' }, runs: { structure: { kind: 'offer', paid: false } }, onrun: () => {} } },
      { label: 'Run: paid offers (illustrative)', props: { title: 'B4P', premise: { kind: 'missing' }, structure: { kind: 'loaded', data: overviewUnnamed }, coverage: { kind: 'missing' }, runs: { structure: { kind: 'offer', paid: true, maxCalls: overviewPreflight.structureNaming.maxCalls }, coverage: { kind: 'offer', paid: true, maxCalls: overviewPreflight.coverage.maxCalls }, premise: { kind: 'offer', paid: true, maxCalls: overviewPreflight.premise.maxCalls } }, onrun: () => {} } },
      { label: 'Run: needs a budget (illustrative)', props: { title: 'B4P', premise: { kind: 'missing' }, structure: { kind: 'missing' }, coverage: { kind: 'missing' }, runs: { structure: { kind: 'offer', paid: false }, coverage: { kind: 'needs-budget' }, premise: { kind: 'needs-budget' } }, onrun: () => {}, onsetbudget: () => {} } },
      { label: 'Run: running and blocked (illustrative)', props: { title: 'B4P', premise: { kind: 'missing' }, structure: { kind: 'missing' }, coverage: { kind: 'missing' }, runs: { coverage: { kind: 'running', paid: true, progress: 'Scene 12 of 57' }, structure: { kind: 'blocked', reason: 'Another analysis is running on this story. This one can start when it finishes.' }, premise: { kind: 'blocked', reason: 'Another analysis is running on this story. This one can start when it finishes.' } } } },
      { label: 'Run: stopped at the budget, with and without the amounts (illustrative)', props: { title: 'B4P', premise: { kind: 'missing' }, structure: { kind: 'missing' }, coverage: { kind: 'missing' }, runs: { coverage: { kind: 'budget-reached', usd: '10.00', spentUsd: '10.00', maxCalls: overviewPreflight.coverage.maxCalls }, premise: { kind: 'budget-reached', maxCalls: overviewPreflight.premise.maxCalls } }, onrun: () => {}, onsetbudget: () => {} } },
      { label: 'Run: failed, offered again (illustrative)', props: { title: 'B4P', premise: { kind: 'missing' }, structure: { kind: 'missing' }, coverage: { kind: 'missing' }, runs: { premise: { kind: 'failed', message: 'PROVIDER_TIMEOUT: the provider did not answer in time', offer: { paid: true, maxCalls: overviewPreflight.premise.maxCalls } } }, onrun: () => {} } },
      { label: 'Run: done, one line per provider (illustrative)', props: { title: 'B4P', ...overviewReads, advanced: true, runs: { coverage: { kind: 'done', totals: [{ attempts: 3, provider: 'openrouter', model: 'qwen/qwen3-235b-a22b' }], maxCalls: overviewPreflight.coverage.maxCalls }, structure: { kind: 'offer', paid: true, maxCalls: 0 } } } },
    ],
  },
  {
    id: 'story-overview-outline', name: 'StoryOverviewOutline', kind: 'component', section: 'screens', group: 'drafts', component: StoryOverviewOutline,
    examples: [
      { label: 'B4P (captured)', props: { ...overviewReads, current: 'coverage', onjump: () => {} } },
      { label: 'Mixed states', props: { premise: { kind: 'missing' }, structure: { kind: 'loaded', data: overviewUnnamed }, coverage: { kind: 'failed', message: 'x' }, onjump: () => {} } },
      { label: 'Reading', props: {} },
    ],
  },
  {
    id: 'story-overview-side', name: 'StoryOverviewSide', kind: 'component', section: 'screens', group: 'drafts', component: StoryOverviewSide,
    examples: [
      { label: 'A turn (captured)', props: { ...overviewReads, selected: { kind: 'turn', index: 0 }, onRevealScene: () => {} } },
      { label: 'A character (captured)', props: { ...overviewReads, selected: { kind: 'character', index: storyOverview['coverage/report'].characters.findIndex((c) => c.strengths.value.length > 0) } } },
      { label: 'Empty', props: { ...overviewReads } },
    ],
  },
  {
    // The Overview's strip (khaos-app#617). The verdict is B4P's captured coverage; the budget,
    // the review count and the next step are illustrative.
    id: 'story-overview-strip', name: 'StoryOverviewStrip', kind: 'component', section: 'screens', group: 'drafts', component: StoryOverviewStrip,
    examples: [
      { label: 'B4P verdict (captured), spend and next step (illustrative)', props: { ...overviewStrip, oncoverage: () => {}, onbudget: () => {}, onreview: () => {}, onnext: () => {} } },
      { label: 'No budget set, nothing to review (illustrative)', props: { ...overviewStrip, budget: { kind: 'none' }, review: 0, onbudget: () => {} } },
      { label: 'Budget spent (illustrative)', props: { ...overviewStrip, budget: { kind: 'loaded', usd: '10.00', spentUsd: '10.00', remainingUsd: '0' } } },
      { label: 'Empty', props: {} },
    ],
  },
  {
    id: 'reading-readiness', name: 'ReadingReadiness', kind: 'component', section: 'screens', group: 'drafts', component: ReadingReadiness,
    examples: [
      { label: 'B4P, first scene (captured)', props: { readiness: { kind: 'loaded', readiness: readingReadiness }, sceneId: readingReadiness.scenes[0].sceneId, onLockVoice: () => {} } },
      { label: 'B4P, Advanced (captured)', props: { readiness: { kind: 'loaded', readiness: readingReadiness }, sceneId: readingReadiness.scenes[0].sceneId, advanced: true, onLockVoice: () => {} } },
      { label: 'A refused scene (illustrative)', props: { readiness: { kind: 'loaded', readiness: readinessRefused }, sceneId: readingReadiness.scenes[0].sceneId, onLockVoice: () => {} } },
      { label: 'Voices need attention (illustrative)', props: { readiness: { kind: 'loaded', readiness: readinessVoices }, sceneId: readingReadiness.scenes[0].sceneId, onLockVoice: () => {} } },
      { label: 'Voices blocked from rendering (illustrative)', props: { readiness: { kind: 'loaded', readiness: readinessBlocked }, sceneId: readingReadiness.scenes[0].sceneId, onLockVoice: () => {}, onRecast: () => {}, onDownloadModels: () => {} } },
      { label: 'Checking', props: { readiness: { kind: 'loading' } } },
      { label: 'Not checked (illustrative error)', props: { readiness: { kind: 'failed', message: 'READINESS_FAILED' } } },
    ],
  },
  {
    id: 'place-areas', name: 'PlaceAreas', kind: 'component', section: 'screens', group: 'places', component: PlaceAreas,
    examples: [
      { label: `${placeBuilderStates.name}: six areas, collapsed (captured)`, props: { read: { kind: 'loaded', areas: placeBuilderStates.preparation.areas } } },
      { label: 'Three areas, open (captured)', props: { read: { kind: 'loaded', areas: placeBuilderStates.preparation.areas.slice(0, 3) } } },
      { label: 'Reading', props: { read: { kind: 'loading' } } },
      { label: 'Read failed', props: { read: { kind: 'failed', message: 'PLACE_BUILDER_FAILED: no such place' } } },
      { label: 'Empty', props: { read: { kind: 'loaded', areas: [] } } },
    ],
  },
  {
    id: 'subject-design', name: 'SubjectDesign', kind: 'component', section: 'screens', group: 'places', component: SubjectDesign,
    examples: [
      { label: 'Design in use (illustrative)', props: { kind: 'location', name: focusPlace?.name ?? '', design: { kind: 'chosen', image: { url: DEMO_COVER } }, ondesign: () => {} } },
      { label: 'Designing (illustrative)', props: { kind: 'location', name: focusPlace?.name ?? '', design: { kind: 'awaiting' }, activity: 'Drawing 2 of 4…', ondesign: () => {} } },
      { label: 'Reading', props: { kind: 'object', design: { kind: 'reading' } } },
      { label: 'Artwork not read', props: { kind: 'object', design: { kind: 'chosen', image: { url: '', error: 'NOT_FOUND: reference sheet missing' } }, ondesign: () => {} } },
      { label: 'Empty', props: { kind: 'location', design: { kind: 'none' }, ondesign: () => {} } },
    ],
  },
  {
    id: 'place-side', name: 'PlaceSide', kind: 'component', section: 'screens', group: 'places', component: PlaceSide,
    examples: [
      { label: `${focusPlace?.name ?? 'Place'} (captured identity, illustrative design state)`, props: { selected: true, name: focusPlace?.name ?? '', design: { kind: 'none' }, ondesign: () => {} }, snippets: identitySnippet('location', focusPlace) },
      { label: 'Designed (illustrative)', props: { selected: true, name: focusPlace?.name ?? '', design: { kind: 'chosen', image: { url: DEMO_COVER } }, direction: placeDirection, ondesign: () => {} }, snippets: identitySnippet('location', focusPlace) },
      { label: `${placeBuilderStates.name}: four states, Interior · Day shown (captured states, illustrative design)`, props: { selected: true, name: placeBuilderStates.name, design: { kind: 'chosen', image: { url: DEMO_COVER } }, states: placeBuilderStates.states, state: 'INT|DAY|', onstate: () => {}, ondesign: () => {} } },
      { label: 'A state not read (captured states, illustrative error)', props: { selected: true, name: placeBuilderStates.name, design: { kind: 'none' }, states: placeBuilderStates.states, state: 'INT|DAY|', stateError: 'PLACE_BUILDER_FAILED: the place builder could not read this state', onstate: () => {}, ondesign: () => {} } },
      { label: 'One state: nothing to choose (captured)', props: { selected: true, name: placeBuilderStates.name, design: { kind: 'chosen', image: { url: DEMO_COVER } }, states: placeBuilderStates.states.slice(0, 1), state: placeBuilderStates.states[0].key, ondesign: () => {} } },
      { label: 'Empty', props: { selected: false } },
    ],
  },
  {
    // Both fill the panel a host gives them and have no size of their own, so they are shown
    // filling the canvas, as a screen is.
    id: 'place-plan', name: 'PlacePlan', kind: 'screen', section: 'screens', group: 'places', component: PlacePlan,
    examples: [
      { label: 'The conformance place (kit v0.4.0)', props: { definition: placeConformance, onselect: () => {} } },
      { label: 'A fixture selected', props: { definition: placeConformance, selected: 'Desk', onselect: () => {} } },
      { label: 'A camera selected', props: { definition: placeConformance, selected: 'Corner', onselect: () => {} } },
      { label: 'Empty', props: { definition: null } },
    ],
  },
  {
    id: 'place-viewer', name: 'PlaceViewer', kind: 'screen', section: 'screens', group: 'places', component: PlaceViewer,
    examples: [
      { label: 'Through Corner (kit v0.4.0 build)', props: { definition: placeConformance, model: placeConformanceModel, camera: 'Corner', onselect: () => {}, onload: () => {} } },
      { label: 'Through Back (kit v0.4.0 build)', props: { definition: placeConformance, model: placeConformanceModel, camera: 'Back', onselect: () => {}, onload: () => {} } },
      { label: 'Could not load (bytes that are not a .glb)', props: { definition: placeConformance, model: new Uint8Array([0, 1, 2, 3]), camera: 'Corner' } },
      { label: 'Unknown camera', props: { definition: placeConformance, model: placeConformanceModel, camera: 'Nowhere' } },
      { label: 'Empty', props: { definition: null, model: null } },
    ],
  },
  {
    id: 'place-build-rounds', name: 'PlaceBuildRounds', kind: 'component', section: 'screens', group: 'places', component: PlaceBuildRounds,
    emptyNotApplicable: 'A Build shows its pending tile from the moment it is queued; a host with no Build does not draw this.',
    examples: [
      { label: 'Running, 3 rounds (captured line art)', props: { rounds: buildRounds.slice(0, 3), running: true, spend: '$0.02', detail: buildRoundDetail(3) } },
      { label: 'Completed and submitted (captured line art)', props: { rounds: [...buildRounds.slice(0, 3), { ...buildRounds[3], kind: 'submitted' }], spend: '$0.04', outcome: 'Built in 4 rounds', detail: buildRoundDetail(4) } },
      { label: 'Round limit, with problems (illustrative problems)', props: { rounds: buildRoundsWithProblems, outcome: 'Stopped at the round limit', selected: 4, detail: buildRoundDetail(4, true) } },
      { label: '24 rounds (captured line art, repeated)', props: { rounds: buildRounds24, outcome: 'Stopped at the round limit', detail: buildRoundDetail(4) } },
      { label: 'Queued', props: { rounds: [], running: true, spend: '$0.00' } },
    ],
  },
  {
    // Presets, buildings and kinds are khaosd's (internal/placebuild/structure.go, v0.192.0);
    // the size labels are the host's, illustrative here. Areas are B4P's captured analysed
    // areas, with illustrative ids. The problem is khaosd's NotLaidOut sentence, numbers
    // illustrative. The review below is the conformance place, standing in for a laid-out plan.
    id: 'place-structure', name: 'PlaceStructure', kind: 'component', section: 'screens', group: 'places', component: PlaceStructure,
    examples: [
      { label: 'First layout (illustrative labels)', props: { ...structureBase, preset: '1br1ba', place: 'apartment', first: true, canLayOut: true } },
      { label: `Another layout, ${placeBuilderStates.name} areas (captured areas)`, props: { ...structureBase, preset: '1br1ba', place: 'apartment', another: true, areas: structureAreas, areaKinds: { 'area-0': 'kitchen', 'area-1': 'living', 'area-2': 'bedroom' } }, snippets: { children: [{ component: PlaceReview, props: placeReviewReady }] } },
      { label: 'With problems (illustrative numbers)', props: { ...structureBase, preset: 'studio', place: 'apartment', another: true, areas: structureAreas, problems: ['7 rooms do not fit a 600 sqft apartment at their minimum size'] } },
      { label: 'No areas', props: { ...structureBase, preset: '2br1ba', place: 'house', first: true, canLayOut: true } },
      { label: 'Empty', props: { ...structureBase, first: true, canLayOut: false } },
    ],
  },
  {
    id: 'place-review', name: 'PlaceReview', kind: 'screen', section: 'screens', group: 'places', component: PlaceReview,
    examples: [
      { label: 'Ready to review (kit v0.4.0 build)', props: placeReviewReady },
      { label: 'Through camera Back', props: { ...placeReviewReady, selected: 'Back' } },
      { label: 'An opening selected for editing', props: { ...placeReviewReady, selected: 'Doorway' } },
      { label: 'Unsaved edits', props: { ...placeReviewReady, selected: 'Doorway', draft: placeReviewDraft } },
      { label: 'Saving', props: { ...placeReviewReady, selected: 'Doorway', draft: placeReviewDraft, saving: true } },
      { label: 'Changed since opened', props: { ...placeReviewReady, draft: placeReviewDraft, conflict: 'stale' } },
      { label: 'A build is running', props: { ...placeReviewReady, draft: placeReviewDraft, conflict: 'building' } },
      { label: 'Blender available', props: { ...placeReviewReady, blenderAvailable: true } },
      { label: 'Reviewed', props: { ...placeReviewReady, definition: { ...placeReviewDefinition, review: { state: 'reviewed', notes: 'The doorway and desk read well.' } } } },
      { label: 'On Basic', props: { ...placeReviewReady, advanced: false } },
      { label: 'Loading', props: { advanced: true, loading: true } },
      { label: 'Could not read', props: { advanced: true, error: "The place's definition file is missing." } },
      { label: 'Empty', props: { advanced: true, definition: null } },
    ],
  },
  {
    // The models are the scene's, loaded once; each example is a shot under the playhead.
    id: 'shot-previs', name: 'ShotPrevis', kind: 'screen', section: 'screens', group: 'storyPlayer', component: ShotPrevis,
    examples: [
      { label: 'The conformance shot (kit v0.8.0 build)', props: { ...shotPrevisScene, shot: previsShot } },
      { label: 'Two figures of one build key, tinted apart', props: { ...shotPrevisScene, shot: twinShot } },
      { label: 'Another camera on the same scene', props: { ...shotPrevisScene, shot: { ...previsShot, blocking: { ...shotBlocking, id: 'shot_blocking_reverse', camera: { position: [8.5, 3.5, 1.6], target: [4, 1.5, 0.6], lensMm: 24 } } } } },
      { label: 'Waiting for its place', props: { ...shotPrevisScene, shot: { shotId: 'shot_through', state: 'waiting', reasons: [{ kind: 'placeBuilding', message: 'The place is being built.' }], blocking: null, models: null } } },
      { label: 'Refused by its check', props: { ...shotPrevisScene, shot: { ...previsShot, state: 'refused', reasons: [{ kind: 'visibility', message: 'Rover should be in the shot, but the camera sees none of him.' }] } } },
      { label: 'Not blocked yet', props: { ...shotPrevisScene, shot: { shotId: 'shot_through', state: 'none', reasons: [], blocking: null, models: null } } },
      { label: 'Models not loaded', props: { shot: previsShot, definition: shotPlace, place: null } },
      { label: 'Empty', props: { shot: null } },
    ],
  },
  {
    id: 'shot-plan', name: 'ShotPlan', kind: 'screen', section: 'screens', group: 'storyPlayer', component: ShotPlan,
    examples: [
      { label: 'The conformance shot (kit v0.8.0)', props: shotPlanReady },
      { label: 'A figure selected', props: { ...shotPlanReady, selected: 'Rover' } },
      { label: 'Inspector: the selected figure', props: { ...shotPlanReady, part: 'inspector', selected: 'Rover' } },
      { label: 'Inspector: nothing selected', props: { ...shotPlanReady, part: 'inspector' } },
      { label: 'Empty', props: { blocking: null, definition: null } },
    ],
  },
  {
    id: 'object-table', name: 'ObjectTable', kind: 'component', section: 'screens', group: 'objects', component: ObjectTable,
    examples: [
      { label: 'Objects (captured)', props: { objects: objectRecords, selected: groupObject?.id ?? '', onselect: () => {} } },
      { label: 'Empty', props: { objects: [] } },
      { label: 'Reading', props: { objects: [], status: { kind: 'loading' } } },
      // khaos-app: a failed story read (ATLAS_READ_FAILED on Brick & Steel) once read as an empty story. The message is illustrative.
      { label: 'Read failed (illustrative message)', props: { objects: [], status: { kind: 'failed', message: 'Khaos couldn’t read this story.' }, onretry: () => {} } },
    ],
  },
  {
    id: 'object-detail', name: 'ObjectDetail', kind: 'component', section: 'screens', group: 'objects', component: ObjectDetail,
    examples: [
      { label: `${groupObject?.name ?? 'Object'} (captured)`, props: { object: groupObject, scenes: storyScenes, onRevealScene: () => {}, images: { kind: 'loaded', rows: [] }, onview: () => {} } },
      { label: 'Empty', props: { object: null } },
    ],
  },
  {
    id: 'object-side', name: 'ObjectSide', kind: 'component', section: 'screens', group: 'objects', component: ObjectSide,
    examples: [
      { label: `${groupObject?.name ?? 'Object'} (captured identity, illustrative design state)`, props: { selected: true, name: groupObject?.name ?? '', design: { kind: 'none' }, ondesign: () => {} }, snippets: identitySnippet('object', groupObject) },
      { label: 'Designed (illustrative)', props: { selected: true, name: groupObject?.name ?? '', design: { kind: 'chosen', image: { url: objectFigure } }, direction: objectDirection, ondesign: () => {} }, snippets: identitySnippet('object', groupObject) },
      { label: 'Empty', props: { selected: false } },
    ],
  },
]

// The Images and Audio destinations' panes (catalog app-coverage plan, T5), on Broken in 4
// Places as khaosd serves it (images-audio-destination.json): the images of Madison, Desmond's
// apartment and the largest object group, every recording of the first scene, and one line
// take's waveform. Image bytes and audio have no capture: the illustrative figures stand in
// for the images (D62), and the line take plays no sound. The project refuses no take, so the
// refused examples are built from its captured recordings and say so.
const imageSubjects = imagesAudio.subjects
const firstImageRows = imageRows(imageSubjects)
const generatedRow = firstImageRows.find((r) => r.provenance) ?? firstImageRows[0] ?? null
const uploadedRow = firstImageRows.find((r) => r.origin === 'uploaded') ?? null
const thumbUrls = Object.fromEntries(firstImageRows.map((r) => [r.referenceId, r.subjectKind === 'character' ? madisonFigure : DEMO_COVER]))
const sceneRecordings = imagesAudio.recordings
const lineTake = sceneRecordings.find((r) => r.id === imagesAudio.peaks.recordingId) ?? null
const sceneRead = sceneRecordings.find((r) => r.kind === 'scene') ?? null
// KSPD v0.106.0's assembled shape, which khaosd does not serve yet: the read's own file, made
// from three of the captured line takes rather than by a provider.
const assembledRead = sceneRead && {
  ...sceneRead,
  media: { format: sceneRead.media.format, sizeBytes: sceneRead.media.sizeBytes, assembledFrom: sceneRecordings.filter((r) => r.kind === 'line').slice(0, 3).map((r) => r.id) },
}
const sceneReadSnippets = { read: [{ component: ReadTimeline, props: { state: { kind: 'loaded' }, segments: [sceneReadSegment], peaks: sceneReadData.readPeaks ?? null, currentTime: 0, selectedElementId: readLines[0]?.eventId ?? '' } }] }
const takePeaks = { [imagesAudio.peaks.recordingId]: { kind: 'loaded', peaks: imagesAudio.peaks.value } }
const refusedFrom = (r, code, reason) => ({ kind: r.kind, id: r.id, scene: r.scene, code, reason })
const illustrativeRefused = lineTake ? [
  refusedFrom(lineTake, 'TAKE_NOT_CONFORMANT', 'take document is nonconformant: audio sha256 does not match the file'),
  refusedFrom({ ...lineTake, id: `${lineTake.id}-2`, scene: undefined }, 'TAKE_NOT_CONFORMANT', 'take document names no event'),
] : []
const mediaPanes = [
  {
    id: 'image-table', name: 'ImageTable', kind: 'component', section: 'screens', group: 'images', component: ImageTable,
    examples: [
      { label: 'Images (captured, illustrative thumbnails)', props: { rows: firstImageRows, urls: thumbUrls, selected: generatedRow?.referenceId ?? '', onselect: () => {}, onthumb: () => {} } },
      { label: 'Thumbnails reading', props: { rows: firstImageRows, onthumb: () => {} } },
      { label: 'Empty', props: { rows: [] } },
    ],
  },
  {
    id: 'image-detail', name: 'ImageDetail', kind: 'component', section: 'screens', group: 'images', component: ImageDetail,
    examples: [
      { label: 'A generated image (captured, illustrative image)', props: { row: generatedRow, src: madisonFigure, onRevealSubject: () => {} } },
      { label: 'An uploaded image (captured)', props: { row: uploadedRow, src: '', onRevealSubject: () => {} } },
      { label: 'Empty', props: { row: null } },
    ],
  },
  {
    id: 'image-side', name: 'ImageSide', kind: 'component', section: 'screens', group: 'images', component: ImageSide,
    examples: [
      { label: 'A generated image (captured)', props: { row: generatedRow } },
      { label: 'Empty', props: { row: null } },
    ],
  },
  {
    id: 'audio-table', name: 'AudioTable', kind: 'component', section: 'screens', group: 'audio', component: AudioTable,
    examples: [
      { label: 'The first scene (captured)', props: { rows: sceneRecordings, peaks: takePeaks, selected: lineTake?.id ?? '', onselect: () => {}, onpeaks: () => {} } },
      { label: 'Peaks failed', props: { rows: sceneRecordings.slice(0, 3), peaks: Object.fromEntries(sceneRecordings.slice(0, 3).map((r) => [r.id, { kind: 'failed', message: 'peaks unavailable: the audio file could not be decoded' }])) } },
      { label: 'Empty', props: { rows: [] } },
    ],
  },
  {
    id: 'audio-detail', name: 'AudioDetail', kind: 'component', section: 'screens', group: 'audio', component: AudioDetail,
    examples: [
      { label: 'A line take (captured, silent)', props: { recording: lineTake, playback: { kind: 'ready', url: '' }, peaks: takePeaks[imagesAudio.peaks.recordingId], onRevealScene: () => {}, onRevealCharacter: () => {}, onOpenVoice: () => {} } },
      { label: "A scene read (another scene's captured read)", props: { recording: sceneRead, onRevealScene: () => {}, onOpenVoice: () => {} }, snippets: sceneReadSnippets },
      { label: 'A scene read assembled from takes (illustrative media)', props: { recording: assembledRead, onRevealScene: () => {}, onOpenVoice: () => {} }, snippets: sceneReadSnippets },
      { label: 'Reading the recording', props: { recording: lineTake, playback: { kind: 'loading' } } },
      { label: 'Recording not read', props: { recording: lineTake, playback: { kind: 'failed', message: 'NOT_FOUND: take audio missing' } } },
      { label: 'Empty', props: { recording: null } },
    ],
  },
  {
    id: 'audio-side', name: 'AudioSide', kind: 'component', section: 'screens', group: 'audio', component: AudioSide,
    examples: [
      { label: 'A line take (captured)', props: { recording: lineTake } },
      { label: 'A scene read (captured)', props: { recording: sceneRead } },
      { label: 'Following a line', props: { recording: sceneRead },
        snippets: { line: [{ component: LineInspector, props: { event: evictionAction ? { elementType: 'action', text: evictionAction.text } : null, backLabel: 'Back to the recording' } }] } },
      { label: 'Empty', props: { recording: null } },
    ],
  },
  {
    id: 'refused-takes', name: 'RefusedTakes', kind: 'component', section: 'screens', group: 'audio', component: RefusedTakes,
    examples: [
      { label: 'Refused line takes (illustrative refusals)', props: { refused: illustrativeRefused, onRevealScene: () => {} } },
      { label: 'Empty', props: { refused: imagesAudio.refused } },
    ],
  },
]

// The Review destination as khaosd serves it (review-destination.json): per kind the largest group
// of identical mentions, the largest mention of a person, and a relation KSPD offers links for,
// with their scene-analysis suggestions. The groups are the capture's, one per kind. What each
// record offers and what a suggestion stands for are Khaos App's (`decisionsFor`,
// `suggestionOffer`), not the engine's: the examples here use its words, with stand-in decisions
// that only enable the buttons.
const pendingReview = reviewDestination.pending
const reviewItems = {
  entity: pendingReview.entityAppearances.map((record) => ({ kind: 'entityAppearance', record })),
  object: pendingReview.objectAppearances.map((record) => ({ kind: 'objectAppearance', record })),
  location: pendingReview.locationAppearances.map((record) => ({ kind: 'locationAppearance', record })),
  place: pendingReview.references.filter((r) => r.referentKind === 'location').map((record) => ({ kind: 'reference', record })),
  person: pendingReview.references.filter((r) => r.referentKind === 'entity').map((record) => ({ kind: 'reference', record })),
  relation: pendingReview.relations.map((record) => ({ kind: 'relation', record, offers: pendingReview.relationEndpoints.filter((o) => o.candidateId === record.id) })),
}
const mentionGroup = (key, items) => ({ key, kind: items[0].kind, label: reviewTitle(items[0]), items, scenes: new Set(items.map((i) => i.record.sceneId)).size })
const reviewQueue = Object.entries(reviewItems).filter(([, items]) => items.length).map(([key, items]) => mentionGroup(key, items))
const pendingCount = Object.values(reviewItems).flat().length
const doorGroup = reviewQueue.find((g) => g.key === 'object') ?? null
const sceneIndex = new Map(scenesDestination.scenes.map((s) => [s.id, s.index + 1]))
const reviewSceneNumber = (sceneId) => sceneIndex.get(sceneId) ?? null
const reviewStory = {
  characters: charactersDestination.characters.map((c) => ({ id: c.id, name: c.name, aliases: c.aliases })),
  objects: scenesDestination.objects.map((o) => ({ id: o.id, name: o.name })),
  groups: scenesDestination.objects.filter((o) => o.identityKind === 'group').map((o) => ({ id: o.id, name: o.name })),
  locations: scenesDestination.locations.map((l) => ({ id: l.id, name: l.name })),
}
const STAND_IN = {}
const UNRESOLVED = 'Leave unresolved'
const verdicts = (bind, not, bindLabel = 'Bind') => [
  { verdict: 'bound', label: bindLabel, primary: true, decision: bind ? STAND_IN : null },
  { verdict: 'refused', label: not, primary: false, decision: STAND_IN },
  { verdict: 'unresolved', label: UNRESOLVED, primary: false, decision: STAND_IN },
]
/** Khaos App's answers for a record in the action, in its words. */
function illustrativeAnswers(item) {
  if (item.kind === 'entityAppearance') return [{ key: 'new', title: 'A new character', subtitle: `named ${item.record.name}` }, { key: 'existing', title: 'Someone already in the story', subtitle: 'choose who' }]
  if (item.kind === 'objectAppearance') return [
    ...item.record.candidateObjectIds.map((id) => ({ key: `existing:${id}`, title: `Same as ${nameIn(reviewStory.objects, id)}`, subtitle: 'already in the story' })),
    { key: 'existing', title: 'Something already in the story', subtitle: 'choose which' },
    { key: 'new:individual', title: 'A new object', subtitle: 'one thing' },
    { key: 'new:group', title: 'A new group of objects', subtitle: 'several of the same thing' },
  ]
  if (item.kind === 'locationAppearance') return [
    ...item.record.candidateLocationIds.map((id) => ({ key: `existing:${id}`, title: `Same as ${nameIn(reviewStory.locations, id)}`, subtitle: 'already in the story' })),
    { key: 'existing', title: 'Something already in the story', subtitle: 'choose which' },
    { key: 'new', title: 'A new place', subtitle: `named ${item.record.proposedDisplayName ?? item.record.sourcePhrase}` },
  ]
  return []
}
/** Khaos App's offers for the choice so far, in its words. */
const illustrativeDecisions = (item) => ({ answer, pick }) => {
  if (item.kind === 'entityAppearance') {
    const chosen = answer === 'new' || (answer === 'existing' && !!pick)
    return {
      kind: 'decidable', create: null, buttons: verdicts(chosen, 'Not a character'),
      hint: !chosen ? 'Choose who it is to bind it. “Not a character” and “Leave unresolved” need no choice.'
        : answer === 'new' ? `Bind adds ${item.record.name} to the story as a new character.` : `Bind adds this appearance to ${nameIn(reviewStory.characters, pick)}.`,
    }
  }
  if (item.kind === 'objectAppearance' || item.kind === 'locationAppearance') {
    const noun = item.kind === 'objectAppearance' ? 'object' : 'place'
    const not = item.kind === 'objectAppearance' ? 'Not an object' : 'Not a place'
    const waiting = answer === null ? 'Choose an answer to bind it.' : answer === 'existing' && !pick ? `Choose which ${noun} to bind it.` : ''
    return {
      kind: 'decidable', create: null, buttons: verdicts(!waiting, not),
      hint: waiting ? `${waiting} “${not}” and “${UNRESOLVED}” need no choice.` : `Bind accepts this answer. “${not}” says the phrase names no ${noun}. ${UNRESOLVED} records that you can't tell yet.`,
    }
  }
  if (item.kind === 'reference') {
    const person = item.record.referentKind === 'entity'
    const pool = person ? reviewStory.characters : reviewStory.locations
    const create = characterNamed(item.record.name, pool) ? null : { kind: person ? 'character' : 'location', name: item.record.name, identityKind: null, sameName: null }
    return {
      kind: 'decidable', create, buttons: verdicts(!!pick, 'Refuse'),
      hint: pick ? `Bind records that “${item.record.sourcePhrase}” names ${nameIn(pool, pick)}. Refuse and Leave unresolved need no choice.` : 'Pick who or what is named to bind it. Refuse and Leave unresolved need no choice.',
    }
  }
  const sides = [['from', item.record.fromPhrase, item.record.fromId], ['to', item.record.toPhrase, item.record.toId]].filter(([, , id]) => !id)
  return {
    kind: 'decidable', create: null,
    buttons: [
      { verdict: 'bound', label: 'Accept', primary: true, decision: null },
      ...item.offers.map((o) => ({ verdict: 'link', label: `Link “${o.side === 'from' ? item.record.fromPhrase : item.record.toPhrase}” to ${nameIn([...reviewStory.characters, ...reviewStory.objects, ...reviewStory.locations], o.link.id)}`, primary: false, decision: STAND_IN })),
      ...verdicts(false, 'Refuse').slice(1),
    ],
    hint: `${sides.map(([, phrase]) => `“${phrase}”`).join(' and ')} ${sides.length > 1 ? 'are' : 'is'} not linked yet. Link it, then accept. Refuse and Leave unresolved need no choice.`,
  }
}
const reviewExample = (label, item) => ({
  label,
  props: { item, story: reviewStory, sceneNumber: reviewSceneNumber, answers: illustrativeAnswers(item), decisionsFor: illustrativeDecisions(item), ondecide: async () => false, oncreate: async () => false },
})
// The suggestions on the door with the most, and Khaos App's words for them.
const SUGGESTION_SAYS = { bind: 'This is someone or something already in the story.', new: 'This is new to the story.', cannot_tell: 'The scene does not settle this.', supported: 'The scene supports this relation.' }
const suggestionRows = (recordId) => reviewDestination.suggestions.filter((s) => s.recordId === recordId).map((suggestion) => ({
  suggestion,
  offer: suggestion.outcome !== 'accepted'
    ? { says: SUGGESTION_SAYS[suggestion.suggestion] ?? suggestion.suggestion, accepts: [], needs: `The engine did not accept this suggestion. ${suggestion.reason ?? ''}`.trim() }
    : suggestion.suggestion === 'new'
      ? { says: SUGGESTION_SAYS.new, accepts: [{ label: 'Accept as one thing', decision: STAND_IN }, { label: 'Accept as a group', decision: STAND_IN }], needs: '' }
      : { says: SUGGESTION_SAYS[suggestion.suggestion] ?? suggestion.suggestion, accepts: [], needs: '' },
}))
const doorSuggested = [...(doorGroup?.items ?? [])].sort((a, b) => suggestionRows(b.record.id).length - suggestionRows(a.record.id).length)[0] ?? null
const doorSuggestions = doorSuggested ? suggestionRows(doorSuggested.record.id) : []
const rejectedSuggestion = reviewDestination.suggestions.find((s) => s.outcome === 'rejected')
const rejectedRows = rejectedSuggestion ? suggestionRows(rejectedSuggestion.recordId) : []
const partOfDoors = doorGroup && { ...doorGroup, included: doorGroup.items.slice(2) }

// Khaos App's windows (catalog app-coverage plan, T9), from app-windows.json and the captures the
// kit's own fixtures already use. The startup checks are the app's own names and khaosd's
// version; their states are illustrative. On this install history is off (khaosd answers
// FEATURE_OFF) and this project has no committed v3 story (ACTIVITY_SOURCE_MISSING), so the
// populated history and activity examples are illustrative, and labelled so.
// LauncherWindow's welcome window: WelcomeWindow's Basic example, drawn by the host.
const launcherWelcome = [{ component: WelcomeWindow, props: { ...welcomeReady, ...welcomeFor('basic'), projects: welcomeProjects, jobFor: welcomeJobFor, ...welcomeHandlers } }]

const startupChecks = (state) => [
  { name: 'khaosd runtime', state, detail: state === 'ok' ? 'running' : '' },
  { name: 'khaosd handshake', state, detail: state === 'ok' ? `khaosd ${engineData.daemonVersion}` : '' },
  { name: 'On-device engines', state, detail: state === 'ok' ? `${servicesData.length} reported` : '' },
  { name: 'Routing', state, detail: state === 'ok' ? 'settings read' : '' },
]
const illustrativeCheckpoints = [
  { commit: 'c3', message: 'Tighten the eviction scene', at: '2026-10-21T18:40:00Z', restorable: true },
  { commit: 'c2', message: 'After the first analysis', at: '2026-10-20T09:12:00Z', restorable: true },
  { commit: 'c1', message: 'Imported', at: null, restorable: false },
]
const illustrativeActivity = [
  { key: '2026-10-21', title: 'Today', rows: [
    { seq: 3, at: '2026-10-21T18:40:00Z', kind: 'adjudication', actor: 'k', decision: { kind: 'bind', targetKind: 'reference', targetId: 'ref_home' }, changed: ['reference'] },
    { seq: 2, at: '2026-10-21T18:31:00Z', kind: 'analysis', actor: 'khaos-tools', changed: ['scene-analysis', 'character-analysis'] },
  ] },
  { key: '2026-10-20', title: 'Yesterday', rows: [{ seq: 1, at: '2026-10-20T09:12:00Z', kind: 'import', actor: 'k', changed: ['scene', 'character', 'location'] }] },
]
// The data-layer window holds one destination's three panes. Each is that pane's own first
// fixture example, so the window shows what the panes show and restates none of it.
const paneFixtures = [...characterPanes, ...scenePanes, ...placePanes, ...mediaPanes]
const paneOf = (id) => {
  const fixture = paneFixtures.find((f) => f.id === id)
  return [{ component: fixture?.component, props: fixture?.examples[0]?.props }]
}
const shellWindow = (destination, label) => ({
  title: 'BROKEN IN 4 PLACES',
  modes: [{ value: 'data', label: 'Data' }, { value: 'atlas', label: 'Atlas' }, { value: 'player', label: 'Player' }],
  presentation: 'data',
  panes: toolbarPanes,
  commands: toolbarCommands,
  filter: '',
  filterLabel: `Filter ${label.toLowerCase()}`,
  workspace: 'story',
  workspaces: workspaceModes.slice(0, 2),
  layout: dockStory,
  panels: { ...dockPanels, table: { ...dockPanels.table, label } },
  sections: sourceSections,
  destination,
  onPresentation: () => {}, onTogglePane: () => {}, onRun: () => {}, onFilter: () => {}, onWorkspace: () => {}, onLayoutChange: () => {}, onDestination: () => {},
})
const shellDestination = (destination, label) => {
  const pane = destination.replace(/s$/, '')
  return {
    label: `${label} (captured panes)`,
    props: shellWindow(destination, label),
    snippets: { table: paneOf(`${pane}-table`), detail: paneOf(`${pane}-detail`), side: paneOf(`${pane}-side`) },
  }
}
const capturedModels = appWindowsData.models
// As Khaos App names an engine: the captured services list's name for that id, else nothing.
const serviceName = (id) => servicesData.find((s) => s.id === id)?.name ?? ''
const windowPanes = [
  {
    id: 'splash', name: 'Splash', kind: 'screen', section: 'screens', group: 'splashWindow', component: Splash,
    emptyNotApplicable: 'The splash always shows its mark and the checks it runs.',
    examples: [
      { label: 'Checks running (illustrative states)', props: { appVersion: '0.86.0', checks: startupChecks('pending') } },
      { label: 'All checks passed (illustrative states)', props: { appVersion: '0.86.0', checks: startupChecks('ok') } },
      { label: 'The engine did not start (illustrative)', props: { appVersion: '0.86.0', checks: [{ name: 'khaosd runtime', state: 'failed', detail: 'khaosd is not running' }, ...startupChecks('skipped').slice(1)] } },
    ],
  },
  {
    // Voice names, languages and providers are captured (voices.json); the panes' states and the
    // studio's takes are illustrative.
    id: 'voices', name: 'Voices', kind: 'screen', section: 'screens', group: 'voicesWindow', component: Voices,
    examples: [
      { label: 'Speak a line (captured voices)', props: { view: 'speak', voices: voicesWindowVoices, profileId: voicesWindowVoices[0]?.id ?? '', picked: { name: voicesWindowVoices[0]?.name ?? '', directionReason: '', hosted: null }, line: 'We were never meant to find this place.', canSpeak: true, onProfile: () => {}, onSpeak: () => {} } },
      { label: 'Your voices (captured voices)', props: { view: 'profiles', voices: voicesWindowVoices, ownId: voicesWindowVoices[1]?.id ?? '', ownVoice: { id: voicesWindowVoices[1]?.id ?? '', name: voicesWindowVoices[1]?.name ?? '', kind: 'A preset speaker', language: voicesWindowVoices[1]?.language ?? '', notLocked: false, removal: '', remove: null, lock: null }, onOwn: () => {} } },
      { label: 'Voice studio', props: { view: 'studio', voices: voicesWindowVoices, studio: { kind: 'local' } }, snippets: { voiceStudio: [{ component: VoiceStudio, props: { modes: ['Design', 'Clone', 'Preset'] } }] } },
      { label: 'A refusal (illustrative message)', props: { view: 'speak', voices: voicesWindowVoices, outcomes: [{ key: 'speech', tone: 'error', title: 'khaosd did not speak that', detail: 'No provider is connected for Speech Generation.' }] } },
      { label: 'Paid from an open story (illustrative stories)', props: { view: 'speak', voices: voicesWindowVoices, story: { choices: voicesStories, chosen: voicesStories[0].id, reason: '', fixed: false }, onStory: () => {} } },
      { label: 'Paid from the character’s story (illustrative)', props: { view: 'studio', voices: voicesWindowVoices, studio: { kind: 'local' }, story: { choices: [voicesStories[2]], chosen: voicesStories[2].id, reason: '', fixed: true } }, snippets: { voiceStudio: [{ component: VoiceStudio, props: { modes: ['Design', 'Clone', 'Preset'] } }] } },
      { label: 'No story open (illustrative wording)', props: { view: 'speak', voices: voicesWindowVoices, story: { choices: [], chosen: '', reason: 'Open a story first. Hosted voices are paid from its budget.', fixed: false } } },
      { label: 'Your voices undeclared (illustrative version)', props: { view: 'profiles', own: { kind: 'undeclared', description: 'It does not declare the voice-profile protocol, so your voices are not read from it here. Reported version: khaosd 0.169.0' } } },
      { label: 'Reading', props: { view: 'speak', speak: { kind: 'loading' } } },
      { label: 'Empty', props: { view: 'speak', voices: [] } },
    ],
  },
  {
    id: 'voice-row', name: 'VoiceRow', kind: 'component', section: 'screens', group: 'voicesWindow', component: VoiceRow,
    emptyNotApplicable: 'A row is one voice; the Voices window lists none when the library is empty.',
    examples: [
      { label: 'A voice (captured)', props: { name: voicesData[0]?.name ?? '', language: voicesData[0]?.language ?? '', source: voicesData[0]?.provider ?? '', onclick: () => {} } },
      { label: 'Selected', props: { name: voicesData[1]?.name ?? '', language: voicesData[1]?.language ?? '', source: voicesData[1]?.provider ?? '', selected: true } },
      { label: 'With a status (illustrative)', props: { name: voicesData[2]?.name ?? '', language: voicesData[2]?.language ?? '', source: voicesData[2]?.provider ?? '', status: 'not locked' } },
    ],
  },
  {
    // Project Settings › Budget: one dollar limit (K, 2026-10-24: "one fucking number ($USD) as MAX
    // spend"). ILLUSTRATIVE (D62/D74): khaosd serves this shape from khaos-manager #1032 on.
    id: 'budget-pane', name: 'BudgetPane', kind: 'component', section: 'screens', group: 'projectSettingsWindow', component: BudgetPane,
    examples: [
      { label: 'Limit and spend (illustrative)', props: { budget: { kind: 'loaded', usd: '10.00', spentUsd: '1.23', remainingUsd: '8.77' }, onsave: () => {}, onreset: () => {} } },
      { label: 'Nothing left (illustrative)', props: { budget: { kind: 'loaded', usd: '10.00', spentUsd: '10.00', remainingUsd: '0' }, onsave: () => {}, onreset: () => {} } },
      { label: "No budget yet, the engine's suggestions (illustrative)", props: { budget: { kind: 'none', suggested: { usd: ['10', '25', '100'] } }, onsave: () => {} } },
      { label: 'Saving', props: { budget: { kind: 'loaded', usd: '10.00', spentUsd: '1.23', remainingUsd: '8.77' }, save: { kind: 'saving' } } },
      { label: 'Refused (illustrative error)', props: { budget: { kind: 'loaded', usd: '10.00', spentUsd: '1.23', remainingUsd: '8.77' }, save: { kind: 'invalid', message: 'INVALID_BUDGET: usd must be a decimal' }, onsave: () => {} } },
      { label: 'Not read (illustrative error)', props: { budget: { kind: 'failed', message: 'BUDGET_UNREADABLE: the budget file could not be parsed' } } },
      { label: 'Empty', props: { budget: { kind: 'none' }, onsave: () => {} } },
    ],
  },
  {
    // A story's own settings window (khaos.machine stage 3 display plan A6). ILLUSTRATIVE amounts in
    // khaosd's dollars-only shape (khaos-manager #1032).
    id: 'project-settings', name: 'ProjectSettings', kind: 'screen', section: 'screens', group: 'projectSettingsWindow', component: ProjectSettings,
    examples: [
      { label: 'Limit and spend (illustrative)', props: { budget: { kind: 'loaded', usd: '10.00', spentUsd: '1.23', remainingUsd: '8.77' }, onsave: () => {}, onreset: () => {} } },
      { label: "No budget yet, the engine's suggestions (illustrative)", props: { budget: { kind: 'none', suggested: { usd: ['10', '25', '100'] } }, onsave: () => {} } },
      { label: 'Empty', props: { budget: { kind: 'none' }, onsave: () => {} } },
    ],
  },
  {
    id: 'models-pane', name: 'ModelsPane', kind: 'component', section: 'screens', group: 'settingsWindow', component: ModelsPane,
    examples: [
      { label: "This Mac's models (captured)", props: { inventory: { kind: 'served', models: capturedModels }, engineName: serviceName, token: { text: 'Connected', tone: 'success' }, onDownload: () => {}, onProviders: () => {} } },
      { label: 'A download failed (illustrative)', props: { inventory: { kind: 'served', models: capturedModels.map((m, i) => (i === 0 ? { ...m, installed: false, sizeBytes: 0, download: 'failed', downloadError: 'huggingface-cli: 401 Unauthorized' } : m)) }, engineName: serviceName } },
      { label: 'Confirming a download', props: { inventory: { kind: 'served', models: capturedModels }, engineName: serviceName, confirming: { name: capturedModels[0]?.name ?? '', blurb: 'About 3 GB, from Hugging Face.' } } },
      { label: 'Reading', props: { inventory: { kind: 'unread' } } },
      { label: 'Empty', props: { inventory: { kind: 'served', models: [] } } },
    ],
  },
  {
    // Providers as khaosd lists them: ids and readiness captured in provider-status.json; the
    // titles are the ids, because the capture holds no display names.
    id: 'provider-setup', name: 'ProviderSetup', kind: 'screen', section: 'screens', group: 'settingsWindow', component: ProviderSetup,
    examples: [
      { label: 'Added providers (captured readiness)', props: { embedded: true, configuredProviders: setupProviders, configuredProviderGroups: [{ id: 'all', label: '', providers: setupProviders }], onChoose: () => {}, onShowEngines: () => {} } },
      { label: 'Getting started (illustrative)', props: { onboarding: { kind: 'served', preference: 'cloud' }, pathSetup: { kind: 'served', path: 'basic' }, configuredProviders: setupProviders.slice(0, 2), configuredProviderGroups: [{ id: 'all', label: '', providers: setupProviders.slice(0, 2) }], onOpenSetup: () => {} } },
      { label: 'Adding a key (illustrative plan)', props: { providers: setupProviders, selectedProviderId: setupProviders.find((p) => p.id === 'groq')?.id ?? null, plan: { steps: [{ kind: 'authenticate.apiKey', state: 'available', title: 'Add your API key', inputs: [{ id: 'api_key', label: 'API Key', sensitive: true, required: true }] }] }, isActionable: () => true } },
      { label: 'Before signing in (captured disclosure)', props: { providers: disclosureProvider, selectedProviderId: setupData.disclosures[0]?.providerId ?? null, pendingDisclosure: setupData.disclosures[0] ?? null } },
      { label: 'Reading', props: { loadingProviders: true } },
      { label: 'Empty', props: { configuredProviders: [], configuredProviderGroups: [] } },
    ],
  },
  {
    // The path block is captured (setup.json); the feature rows and connections are illustrative.
    id: 'setup', name: 'Setup', kind: 'screen', section: 'screens', group: 'setupWindow', component: Setup,
    examples: [
      { label: 'Your setup (captured path)', props: { sections: setupSections, digest: setupDigest, onboarding: setupOnboarding('summary') } },
      { label: 'Choosing the path (captured)', props: { onboarding: setupOnboarding('path') } },
      { label: 'Turning features on (illustrative)', props: { onboarding: setupOnboarding('features') } },
      { label: 'The checklist (captured tools)', props: { sections: setupSections, digest: setupDigest, ready: setupSections[0]?.items.length ?? 0, total: setupSections[0]?.items.length ?? 0, canProbe: true, probedLabel: 'Checked 9:41 AM', onProbe: () => {}, onInstall: () => {} } },
      { label: 'Confirming an install (illustrative)', props: { digest: setupDigest, confirm: { target: 'Hugging Face CLI', description: 'Downloads AI models for the speech engines. khaosd will run: brew install huggingface-cli', bulk: false, methods: [{ id: 'brew', label: 'Homebrew' }, { id: 'curl', label: 'curl' }], method: 'brew' } } },
      { label: 'Not checked (illustrative message)', props: { standing: 'khaosd is not reachable, so nothing could be checked.' } },
      { label: 'Empty', props: { digest: [], sections: [] } },
    ],
  },
  {
    // Rows are illustrative: the capture holds no per-kind connect rows.
    id: 'setup-connect', name: 'SetupConnect', kind: 'component', section: 'screens', group: 'setupWindow', component: SetupConnect,
    examples: [
      { label: 'Connect what you need (illustrative)', props: { rows: connectRows, preference: 'cloud', signedInKinds: ['analysis'], onAct: () => {}, onOpenSettings: () => {} } },
      { label: 'Basic path', props: { rows: connectRows, preference: 'cloud', basic: true } },
      { label: 'Finish setup first', props: { rows: [{ ...connectRows[1], state: 'finish-setup' }], finishSetup: { settling: false } } },
      { label: 'Empty', props: { rows: [] } },
    ],
  },
  {
    id: 'resources', name: 'Resources', kind: 'screen', section: 'screens', group: 'resourcesWindow', component: Resources,
    examples: [
      { label: 'The registry (captured)', props: { state: { kind: 'loaded' }, artifacts: catalogData.artifacts, onSelect: () => {} } },
      { label: 'Reading', props: { state: { kind: 'loading' } } },
      { label: 'Could not read (illustrative message)', props: { state: { kind: 'failed', message: 'khaosd is not running.' } } },
      { label: 'Empty', props: { state: { kind: 'loaded' }, artifacts: [] } },
    ],
  },
  {
    id: 'activity', name: 'Activity', kind: 'screen', section: 'screens', group: 'activityWindow', component: Activity,
    examples: [
      { label: 'No committed story (captured)', props: { state: appWindowsData.activity?.error?.code === 'ACTIVITY_SOURCE_MISSING' ? { kind: 'missing' } : { kind: 'loading' }, projectTitle: 'BROKEN IN 4 PLACES' } },
      { label: 'Changes by day (illustrative)', props: { state: { kind: 'loaded' }, projectTitle: 'BROKEN IN 4 PLACES', total: 3, rowCount: 3, days: illustrativeActivity, onQuery: () => {} } },
      { label: 'Filtered to nothing (illustrative)', props: { state: { kind: 'loaded' }, projectTitle: 'BROKEN IN 4 PLACES', total: 3, rowCount: 3, days: [], query: 'merge' } },
      { label: 'Could not read (illustrative message)', props: { state: { kind: 'failed', message: 'khaosd is not running.' }, projectTitle: 'BROKEN IN 4 PLACES' } },
      { label: 'Empty', props: { state: { kind: 'loaded' }, projectTitle: 'BROKEN IN 4 PLACES', total: 0, rowCount: 0 } },
    ],
  },
  {
    id: 'problem-report', name: 'ProblemReport', kind: 'screen', section: 'screens', group: 'problemReportWindow', component: ProblemReport,
    emptyNotApplicable: 'A report always has something to say, even with the engine down; Gathering shows it before it is ready.',
    examples: [
      { label: 'Ready (illustrative report)', props: { state: { kind: 'ready', text: `Khaos App 0.86.0\nkhaosd ${engineData.daemonVersion} · running\nmacOS 27.0 (arm64)\n\n--- khaosd log (last 3 lines) ---\n…` }, onEmail: () => {}, onSave: () => {} } },
      { label: 'Shared (illustrative note)', props: { state: { kind: 'ready', text: 'Khaos App 0.86.0' }, note: 'The report was saved.' } },
      { label: 'Gathering', props: { state: { kind: 'gathering' } } },
      { label: 'Could not gather (illustrative message)', props: { state: { kind: 'failed', message: 'The logs folder could not be read.' }, onGather: () => {} } },
    ],
  },
  {
    // Totals and analysis counts are captured (characters, scenes, locations and their
    // analyses); no objects are captured, so none are shown.
    id: 'project-window', name: 'ProjectWindow', kind: 'screen', section: 'screens', group: 'projectWindow', component: ProjectWindow,
    examples: [
      { label: 'The project (captured totals)', props: { projectTitle: 'BROKEN IN 4 PLACES', overview: projectWindowOverview, categories: projectWindowCategories, onCategory: () => {}, onOpenPlayer: () => {}, onOpenActivity: () => {} } },
      { label: 'With project history (illustrative)', props: { projectTitle: 'BROKEN IN 4 PLACES', overview: projectWindowOverview, categories: projectWindowCategories }, snippets: { history: [{ component: ProjectHistory, props: { view: { kind: 'tracked', repository: { changedFiles: 4 }, checkpoints: illustrativeCheckpoints }, projectTitle: 'BROKEN IN 4 PLACES' } }] } },
      { label: 'Loading', props: { projectTitle: 'BROKEN IN 4 PLACES', status: { kind: 'loading' } } },
      { label: 'Could not read (illustrative message)', props: { projectTitle: 'BROKEN IN 4 PLACES', status: { kind: 'failed', message: 'khaosd is not running.' } } },
      { label: 'Empty', props: { projectTitle: 'Untitled', overview: [], categories: projectWindowCategories } },
    ],
  },
  {
    id: 'project-history', name: 'ProjectHistory', kind: 'component', section: 'screens', group: 'projectWindow', component: ProjectHistory,
    examples: [
      { label: 'Checkpoints (illustrative)', props: { view: { kind: 'tracked', repository: { changedFiles: 4 }, checkpoints: illustrativeCheckpoints }, projectTitle: 'BROKEN IN 4 PLACES', onDiscard: () => {}, onCheckpoint: () => {}, onRestore: () => {}, onRestoreFiles: () => {} } },
      { label: 'Confirming a restore', props: { view: { kind: 'tracked', repository: { changedFiles: 0 }, checkpoints: illustrativeCheckpoints }, projectTitle: 'BROKEN IN 4 PLACES', pending: { kind: 'restore', checkpoint: illustrativeCheckpoints[1], preview: { token: 't', files: ['scene_01.json', 'scene_02.json'] } } } },
      { label: 'After a checkpoint', props: { view: { kind: 'tracked', repository: { changedFiles: 0 }, checkpoints: illustrativeCheckpoints }, projectTitle: 'BROKEN IN 4 PLACES', outcome: { tone: 'success', title: 'Checkpoint made' } } },
      { label: 'Could not read (illustrative message)', props: { view: { kind: 'failed', message: 'khaosd is not running.' } } },
      { label: 'Empty', props: { view: { kind: 'untracked' }, projectTitle: 'BROKEN IN 4 PLACES', onStart: () => {} } },
    ],
  },
]

const reviewPanes = [
  {
    id: 'review-queue', name: 'ReviewQueue', kind: 'component', section: 'screens', group: 'review', component: ReviewQueue,
    examples: [
      { label: 'The queue (captured)', props: { groups: reviewQueue, selected: 'object', onselect: () => {} } },
      { label: 'Empty', props: { groups: [] } },
    ],
  },
  {
    id: 'review-occurrences', name: 'ReviewOccurrences', kind: 'component', section: 'screens', group: 'review', component: ReviewOccurrences,
    examples: [
      { label: 'Every “door” (captured)', props: { group: doorGroup && { ...doorGroup, included: doorGroup.items }, chosen: doorGroup?.items[0]?.record.id ?? '', sceneNumber: reviewSceneNumber, onchoose: () => {}, onexclude: () => {} } },
      { label: 'Two left for later (illustrative marks)', props: { group: partOfDoors, chosen: doorGroup?.items[2]?.record.id ?? '', sceneNumber: reviewSceneNumber, onchoose: () => {}, onexclude: () => {} } },
      { label: 'Sending', props: { group: doorGroup, busy: true, sceneNumber: reviewSceneNumber } },
      { label: 'Empty', props: { group: null } },
    ],
  },
  {
    id: 'review-suggestions', name: 'ReviewSuggestions', kind: 'component', section: 'screens', group: 'review', component: ReviewSuggestions,
    examples: [
      { label: 'Suggestions on a door (captured, illustrative offers)', props: { rows: doorSuggestions, sceneNumber: reviewSceneNumber, onaccept: () => {}, ondismiss: () => {} } },
      { label: 'One the engine refused (captured)', props: { rows: rejectedRows, sceneNumber: reviewSceneNumber } },
      { label: 'Dismissed (illustrative)', props: { rows: doorSuggestions.slice(0, 1).map((r) => ({ ...r, suggestion: { ...r.suggestion, dismissed: true } })), sceneNumber: reviewSceneNumber } },
      { label: 'Empty', props: { rows: [] } },
    ],
  },
  {
    id: 'extraction-review', name: 'ExtractionReview', kind: 'component', section: 'screens', group: 'review', component: ExtractionReview,
    examples: [
      reviewExample('A character in the action (captured)', reviewItems.entity[0]),
      reviewExample('An object in the action (captured)', reviewItems.object[0]),
      reviewExample('A place in the action (captured)', reviewItems.location[0]),
      reviewExample('A person mentioned (captured, Create and bind)', reviewItems.person[0]),
      reviewExample('A place mentioned (captured)', reviewItems.place[0]),
      reviewExample('A relationship (captured)', reviewItems.relation[0]),
      { label: 'Sending', props: { ...reviewExample('', reviewItems.object[0]).props, busy: true } },
      { label: 'Empty', props: { item: null } },
    ],
  },
  {
    id: 'review-side', name: 'ReviewSide', kind: 'component', section: 'screens', group: 'review', component: ReviewSide,
    examples: [
      { label: 'A door, its group of all (captured)', props: { item: doorSuggested, group: doorGroup && { ...doorGroup, included: doorGroup.items }, count: pendingCount },
        snippets: { answer: [{ component: ReviewSuggestions, props: { rows: doorSuggestions, sceneNumber: reviewSceneNumber } }, { component: ExtractionReview, props: reviewExample('', doorSuggested).props }] } },
      { label: 'Two left for later (illustrative marks)', props: { item: doorGroup?.items[2] ?? null, group: partOfDoors, count: pendingCount },
        snippets: { answer: [{ component: ExtractionReview, props: reviewExample('', doorGroup?.items[2] ?? null).props }] } },
      { label: 'No mention chosen', props: { item: null, count: pendingCount } },
      { label: 'Empty', props: { item: null, count: 0 } },
    ],
  },
]

// The text-preview Player on the captured composition (composition.json), timed by the kit's own
// buildTimeline, as Khaos App's player model times it. The playhead sits on the opening scene's
// first spoken beat; its scene text is that scene's beats, as the composition holds them.
const playerTimeline = buildTimeline(compositionData.segments)
const playerOpening = playerTimeline.segments[0] ?? null
const playerFocus = playerOpening?.events.find((e) => e.elementType === 'dialogue') ?? null
const playerProps = {
  state: { kind: 'loaded' }, segments: compositionData.segments, timeline: playerTimeline,
  currentSceneIndex: 0, selectedSceneIndex: 0, playingScene: playerOpening, inspected: playerOpening, focus: playerFocus,
  activeCharacterName: playerFocus?.characterName ?? '', currentTime: playerFocus?.start ?? 0, total: playerTimeline.total,
  playing: false, scale: 10, selectedElementId: playerFocus?.elementId ?? '',
  sceneText: { kind: 'text', text: (playerOpening?.events ?? []).map((e) => e.text ?? '').join('\n\n') },
  onSelectScene: () => {}, onGoToScene: () => {}, onSelect: () => {}, onSeek: () => {}, onTogglePlay: () => {}, onScaleChange: () => {},
}

// The story player on khaosd's playback snapshot (story-playback.json): the opening scene, read,
// with its first spoken line under the playhead. The inspector shows that line, the timeline the
// opening two scenes; Madison's portrait is the catalog's figure, since image bytes are not captured.
const playbackSegments = storyPlaybackData.segments
const playbackOpening = playbackSegments[0] ?? null
const playbackLine = playbackOpening?.events.find((e) => e.elementType === 'dialogue') ?? null
const playbackSpeaker = playbackOpening?.context?.characters.find((c) => c.id === playbackLine?.characterId) ?? null
const unreadScene = playbackSegments.find((s) => s.kind === 'scene' && !s.audio && !s.reads.length) ?? null
const playbackProps = {
  state: { kind: 'loaded' }, segments: playbackSegments, current: playbackOpening, focus: playbackLine,
  portraits: playbackSpeaker ? { [playbackSpeaker.portraitReferenceId]: { state: 'ready', url: madisonFigure } } : {},
  playing: false, time: (playbackLine?.startMs ?? 0) / 1000, inspectorOpen: true,
  onNavigate: () => {}, onOpenReadings: () => {}, onFocusModeChange: () => {}, onTogglePlay: () => {}, onPreviewText: () => {}, onLeavePreview: () => {},
}
const playbackSnippets = {
  inspector: [{ component: PlaybackEventInspector, props: {
    scene: playbackOpening,
    event: playbackLine ? { elementType: playbackLine.elementType, characterName: playbackLine.characterName, text: playbackLine.text, start: (playbackLine.startMs ?? 0) / 1000, duration: playbackLine.durationMs ? playbackLine.durationMs / 1000 : null } : null,
    character: playbackSpeaker ? { id: playbackSpeaker.id, name: playbackSpeaker.name } : undefined,
    portrait: madisonFigure,
  } }],
  timeline: [{ component: StoryPlayer, props: { segments: playbackSegments.slice(0, 2), lanes: ['action', 'dialogue'], currentTime: (playbackLine?.startMs ?? 0) / 1000, playing: false, scale: 10, showContext: false } }],
}

// The Story Atlas as khaosd serves it (story-atlas.json), laid out as the atlas lays it out.
const atlasProps = {
  atlas: storyAtlasData, lens: 'all', onLensChange: () => {}, onSelectRecord: () => {}, onReveal: () => {},
  onBuildAppearance: () => {}, onDesignPlace: () => {}, onActivityChange: () => {}, onOpenActivity: () => {},
}

export const fixtures = [
  // The BrandKit, one screen per axis. It was a single scroll carrying five
  // sections; the palette alone is a 20-column comparison table, so "show me
  // the radii" cost a scroll past every colour in the kit. Four screens put
  // each axis one click from any other, and the axis a reader wants is the one
  // they name — colour, type, shape — not a position in a stack.
  //
  // Tokens is not a fourth axis. It is the index: the other three are
  // predicates over the same parse, and it is the only view that shows what no
  // predicate matched. See Tokens.svelte's header.
  {
    id: 'brand-color', name: 'Color',
    section: 'brandkit', group: 'brand', kind: 'screen', component: Color,
    examples: [{ label: 'Palette', props: {} }],
  },
  {
    id: 'brand-type', name: 'Type',
    section: 'brandkit', group: 'brand', kind: 'screen', component: Type,
    examples: [{ label: 'Scale', props: {} }],
  },
  {
    // Iconography is layer 1. The BrandKit is "colour palette, fonts,
    // typography, type scale, ICONOGRAPHY, photography, logos" — so the set
    // belongs beside colour and type, not in Foundation. Choosing Phosphor over
    // another set fixes stroke weight, corner treatment and optical size across
    // every surface, which is a brand decision and is already treated as one
    // here: G35 icon sizing and G41 stroke width are recorded as belonging to
    // an icon set rather than to a component.
    //
    // ONE SHEET, not one page per glyph. Icon has a single variable — the name
    // — so a page rendering one glyph at a time answers "what does Icon do" and
    // never answers "which icon do I want", which is the only question anyone
    // opens this to ask.
    //
    // The COMPONENT is still a layer-2 Phosphor wrapper by provenance, and the
    // barrel records that. This is the sheet — WHICH SET WE CHOSE — and the
    // sheet is the destination, so it is filed where someone goes looking.
    //
    // `plays` is why the coverage gate still counts Icon: this fixture's
    // component is the sheet, so the export it exercises is declared rather
    // than inferred from the registry line.
    // Weight is an EXAMPLE, not a control inside the sheet. The canvas chrome
    // already renders a per-fixture tablist and a weight is a discrete choice,
    // so owning a SegmentedControl in the body duplicated a channel the shell
    // provides. Derived from the kit's own `weights` so the two lists cannot
    // disagree about which weights Icon accepts.
    id: 'brand-icons', name: 'Icon', kind: 'screen',
    section: 'brandkit', group: 'brand', component: IconSheet, plays: ['Icon'],
    examples: iconWeights.map((w) => ({
      label: w[0].toUpperCase() + w.slice(1),
      props: { weight: w },
    })),
  },
  {
    id: 'brand-shape', name: 'Shape',
    section: 'brandkit', group: 'brand', kind: 'screen', component: Shape,
    examples: [{ label: 'Measures', props: {} }],
  },
  {
    // The between-element measures. Two of its three subjects — grid and
    // rhythm — are not in the kit at all, and the screen states that rather
    // than drawing an invented one.
    id: 'brand-layout', name: 'Layout',
    section: 'brandkit', group: 'brand', kind: 'screen', component: Layout,
    examples: [{ label: 'Measures', props: {} }],
  },
  {
    id: 'brand-tokens', name: 'Tokens',
    section: 'brandkit', group: 'brand', kind: 'screen', component: Tokens,
    examples: [
      { label: 'All', props: {} },
      { label: 'Filtered', props: { query: 'status' } },
    ],
  },
  {
    id: 'status-pill', name: 'StatusPill',
    section: 'components', group: 'labels', kind: 'component', component: StatusPill,
    examples: [
      { label: 'Success', props: { text: 'Complete', tone: 'success', icon: 'check-circle' } },
      { label: 'Skipped', props: { text: 'Skipped', tone: 'skipped', icon: 'minus-circle' } },
    ],
  },
  {
    id: 'metric-card', name: 'MetricCard',
    section: 'components', group: 'cards', kind: 'component', component: MetricCard,
    examples: [
      { label: 'Populated', props: { value: '4.2 min', label: 'Runtime', icon: 'clock', sub: '42% of film' } },
      { label: 'Empty', props: { value: '—', label: 'Runtime', sub: 'no data yet' } },
    ],
  },
  {
    id: 'project-card', name: 'ProjectCard',
    section: 'components', group: 'cards', kind: 'component', component: ProjectCard,
    examples: [
      { label: 'Populated', props: { project: {
        id: 'story_01KJXTKAMJ84E5S7K9J21ZKQZ7', title: 'BROKEN IN 4 PLACES', path: '/Users/k/khaos/projects/broken in 4 places.kspd',
        scene_count: 54, character_count: 27, location_count: 26,
        parsed: true, ingested: true,
        git_repo: true, git_has_remote: false, git_changed_files: 9,
        modified: 1782347691,
      }, onRemove: () => {}, onInitGit: () => {} } },
      // The identity tint over art, keyed on the project ID. The two covered
      // examples use the SAME placeholder and take different colours, which is
      // the behaviour the prop exists for — a launcher where every project ships
      // the same placeholder art still has to stay scannable.
      { label: 'With cover', props: { cover: DEMO_COVER, coverSrcset: DEMO_COVER_SRCSET, project: {
        id: 'story_01KJXTKAMJ84E5S7K9J21ZKQZ7', title: 'BROKEN IN 4 PLACES', path: '/Users/k/khaos/projects/broken in 4 places.kspd',
        scene_count: 54, character_count: 27, location_count: 26,
        parsed: true, ingested: true,
        git_repo: true, git_has_remote: false, git_changed_files: 9,
        modified: 1782347691,
      } } },
      { label: 'Cover, other project', props: { cover: DEMO_COVER, project: {
        id: 'story_01KJXE766HRM6GHX5ECDDZVWDH', title: 'Heart of an Indie: Ignited by Story Intelligence',
        scene_count: 5, character_count: 4, location_count: 3,
        parsed: true,
      } } },
      { label: 'Empty', props: { project: {} } },
      // ILLUSTRATIVE ROWS — the D62 exception, declared here as D62 requires.
      //
      // These render states the machine is not in: parsed-but-unanalysed,
      // mid-analysis, `Needs Update`, the five stage members, and an
      // unrecognised member. Count the derivation's returns with
      // `grep -c 'return {'` over `pipeline`, never from here.
      //
      // D62's second condition is what makes these safe: the analyses are the
      // shape khaos-app builds from khaosd's `GET /api/analysis/staleness`, and
      // the five stages are the `PackageStage*` constants verbatim
      // (kspdprotocol go/kspdprotocol/package_stage.go:37-49, tag
      // go/kspdprotocol/v0.24.0). `summarised` is deliberately NOT a member —
      // it is what a client pinned to v0.24.0 sees when a later producer adds
      // one, which is the case RFC 0067 §8.3 requires us to tolerate.
      //
      // D62's third condition: `apps/catalog/src/data/*.json` is untouched by
      // this. The live capture is not edited to carry any of it.
      { label: 'Parsed, not analysed', props: { project: { ...PROJECT_BASE } } },
      { label: 'Analysing', props: { project: { ...PROJECT_BASE }, analyses: SCENES_ANALYSING } },
      // The stage rungs. `empty` and `imported` sit ABOVE the analysis branches
      // and the other three below them, so `Stage: parsed + analysis complete`
      // renders `Complete` — analysis outranks a member that concedes content
      // exists. `Stage: empty (stale complete)` is the one place a stage still
      // wins, because `empty` is self-certifying: the reader has one inference
      // path and it returns only `parsed`, so `empty` on the wire proves a
      // record exists and any `complete` behind it is stale.
      { label: 'Stage: empty', props: { project: { ...PROJECT_BASE, package_stage: 'empty' } } },
      { label: 'Stage: imported', props: { project: { ...PROJECT_BASE, package_stage: 'imported' } } },
      { label: 'Stage: parsed + analysis complete', props: { project: { ...PROJECT_BASE, package_stage: 'parsed' }, analyses: ALL_ANALYSED } },
      { label: 'Stage: empty (stale complete)', props: { project: { ...PROJECT_BASE, package_stage: 'empty' }, analyses: ALL_ANALYSED } },
      { label: 'Stage: parsed, analysing', props: { project: { ...PROJECT_BASE, package_stage: 'parsed' }, analyses: SCENES_ANALYSING } },
      { label: 'Stage: indexed', props: { project: { ...PROJECT_BASE, package_stage: 'indexed' } } },
      // JOBS — every state of docs/design/project-card-progress.md, numbered as
      // the design numbers them, so `check-catalog` and the rendered pass (A4)
      // cover the `job` prop state by state. `check-catalog` asks only that each
      // EXPORT has a fixture, so a state machine with no rows here would pass
      // the gate while being unrenderable (#78's class).
      //
      // An import's row is the app's pending row or khaosd's in-flight row: a
      // title and nothing measured, so no stage and no counts. Extraction rows
      // carry `package_stage: 'parsed'`, where the extract action lives.
      { label: 'Job 1: import, downloading from iCloud', props: {
        project: IMPORT_ROW, job: { kind: 'import', phase: 'downloading', elapsedMs: 3_000 },
      } },
      { label: 'Job 2: import, starting', props: {
        project: IMPORT_ROW, job: { kind: 'import', phase: 'starting', elapsedMs: 1_000 },
      } },
      { label: 'Job 3: import, queued', props: {
        project: IMPORT_ROW, job: { kind: 'import', phase: 'queued', elapsedMs: 6_000 },
      } },
      { label: 'Job 4: import, running', props: {
        project: IMPORT_ROW, job: { kind: 'import', phase: 'running', elapsedMs: 12_000 },
      } },
      { label: 'Job 4: import, running with a count', props: {
        project: IMPORT_ROW, job: { kind: 'import', phase: 'running', progress: { completed: 12, total: 57 }, elapsedMs: 12_000, remainingMs: 50_000 },
      } },
      { label: 'Job 5: import failed', props: {
        project: IMPORT_ROW, job: { kind: 'import', phase: 'failed' },
      } },
      { label: 'Job 6: extraction, starting', props: {
        project: { ...PROJECT_BASE, package_stage: 'parsed' }, onExtract: () => {},
        job: { kind: 'extract', phase: 'starting', elapsedMs: 0 },
      } },
      { label: 'Job 7: extraction, queued', props: {
        project: { ...PROJECT_BASE, package_stage: 'parsed' }, onExtract: () => {},
        job: { kind: 'extract', phase: 'queued' },
      } },
      { label: 'Job 8: extracting, no count', props: {
        project: { ...PROJECT_BASE, package_stage: 'parsed' }, onExtract: () => {},
        job: { kind: 'extract', phase: 'running', elapsedMs: 44_000 },
      } },
      { label: 'Job 9: extracting, estimating time left', props: {
        project: { ...PROJECT_BASE, package_stage: 'parsed' }, onExtract: () => {},
        job: { kind: 'extract', phase: 'running', progress: { completed: 2, total: 57 }, elapsedMs: 44_000 },
      } },
      { label: 'Job 10: extracting, with time left', props: {
        project: { ...PROJECT_BASE, package_stage: 'parsed' }, onExtract: () => {},
        job: { kind: 'extract', phase: 'running', progress: { completed: 2, total: 57 }, elapsedMs: 44_000, remainingMs: 1_080_000 },
      } },
      // The longest strings the design measured: 1:02:15, 107/107, and
      // "about 1 h 20 min left".
      { label: 'Job 10: extracting, longest strings', props: {
        project: { ...PROJECT_BASE, package_stage: 'parsed' }, onExtract: () => {},
        job: { kind: 'extract', phase: 'running', progress: { completed: 107, total: 107 }, elapsedMs: 3_735_000, remainingMs: 4_800_000 },
      } },
      { label: 'Job 11: finalizing', props: {
        project: { ...PROJECT_BASE, package_stage: 'parsed' }, onExtract: () => {},
        job: { kind: 'extract', phase: 'finalizing', progress: { completed: 57, total: 57 }, elapsedMs: 1_072_000 },
      } },
      { label: 'Job 12: extraction failed', props: {
        project: { ...PROJECT_BASE, package_stage: 'parsed' }, onExtract: () => {},
        job: { kind: 'extract', phase: 'failed', progress: { completed: 31, total: 57 } },
      } },
      { label: 'Job 13: done (no job)', props: {
        project: { ...PROJECT_BASE, package_stage: 'indexed' },
      } },
      // The rail's last three segments: what the host reports of each analysis
      // (hover a segment for its name and count), and a live analysis job.
      { label: 'Analyses: scenes part-done, characters and places not started', props: {
        project: { ...PROJECT_BASE, package_stage: 'indexed' },
        analyses: [
          { kind: 'scenes', state: 'in-progress', progress: { completed: 30, total: 54 } },
          { kind: 'characters', state: 'not-started' },
          { kind: 'places', state: 'not-started' },
        ],
      } },
      { label: 'Analyses: scenes done, characters failed', props: {
        project: { ...PROJECT_BASE, package_stage: 'indexed' },
        analyses: [
          { kind: 'scenes', state: 'done' },
          { kind: 'characters', state: 'failed', progress: { completed: 12, total: 27 } },
        ],
      } },
      { label: 'Job 14: analyzing scenes', props: {
        project: { ...PROJECT_BASE, package_stage: 'indexed' },
        job: { kind: 'analyze-scenes', phase: 'running', progress: { completed: 7, total: 54 }, elapsedMs: 21_000 },
      } },
      // No job and the extract action offered: the state before Job 6.
      { label: 'Extract: available', props: {
        project: { ...PROJECT_BASE, package_stage: 'parsed' },
        onExtract: () => {},
      } },
      { label: 'Stage: enriched, not analysed', props: { project: { ...PROJECT_BASE, package_stage: 'enriched' } } },
      // No `analyses`. An unrecognised member sits BELOW a progressed
      // analysis, so seeding `complete` here rendered `Complete` — a row in a
      // state matrix showing the exact inverse of its own label, and the
      // unrecognised branch reached by no fixture at all. Caught in review.
      { label: 'Stage not recognised', props: { project: {
        ...PROJECT_BASE, package_stage: 'summarised',
      } } },
      // The sixth branch, rendered by no row until now — `needs_migration`
      // appeared nowhere in this catalog, so the comment above claimed to close
      // the branch-coverage gap while silently excluding one. It also outranks
      // every other rung including the two stage members that beat a completed
      // analysis, which is precisely the ordering a surviving mutant showed was
      // unpinned.
      { label: 'Needs Update', props: { project: {
        ...PROJECT_BASE, needs_migration: true, package_stage: 'enriched',
      } } },
    ],
  },
  {id:'picture-timing-review',name:'PictureTimingReview',section:'components',group:'inspectors',kind:'component',component: PictureTimingReview,examples:[{label:'No conflicts',props:{repair:null}}]},
  {id:'composer-export-dialog',name:'ComposerExportDialog',section: 'screens',group: 'dataLayer',kind:'component',component: ComposerExportDialog,examples:[{label: 'Empty',props:{open:true,target:'Choose a project'}}]},
  {
    id: 'scene-shot-planner', name: 'SceneShotPlanner', section: 'components', group: 'inspectors', kind: 'component', component: SceneShotPlanner, examples: [
      {label:'Ready to plan',props:{beatCount:6}},
      {label:'Focused planning workspace',props:{modal:true}},
      {label:'Planning',props:{beatCount:6,busy:true}},
      {label:'Proposed plan to review',props:{beatCount:6,plan:evictionPlan,sceneLabel:evictionTitle}},
      {label:'Planning unavailable',props:{disabled:true}},
    ],
  },
  { id: 'screenplay-editor', name: 'ScreenplayEditor', section: 'screens', group: 'storyScreenplay', kind: 'screen', component: ScreenplayEditor, examples: [
    {label:'Title page',props:{document:screenplayDocument,title:screenplayDocument.title,fields:['credit','author','source','draftDate','contact','copyright'],page:{},selected:'title-page'}},
    {label:'Captured opening scene',props:{document:screenplayDocument,selected:screenplayDocument.scenes[0]?.id}},
    {label:'Saving',props:{document:screenplayDocument,selected:screenplayDocument.scenes[0]?.id,dirty:1,saving:true}},
    {label:'Read failure',props:{error:'The screenplay could not open.'}},
    {label:'Empty',props:{document:{...screenplayDocument,scenes:[]},selected:'title-page'}},
  ]},
  {
    id: 'shot-preview', name: 'ShotPreview', section: 'components', group: 'media', kind: 'component', component: ShotPreview, examples: [
      {label:'Unrendered direction',props:{shot:{title:'At the studio',direction:'Hold a wide view as she notices the locked door.',framing:'Wide shot'},event:{label:'Action',text:'She stops at the door.'}}},
      {label:'Chosen frame',props:{shot:{title:evictionTitle,direction:evictionAction?.text ?? '',framing:'Wide shot'},imageUrl:madisonFigure,review:'Reviewed',event:{label:'Action',text:evictionAction?.text ?? ''}}},
    ],
  },
  {id: 'voice-design-traits', name: 'VoiceDesignTraits', section: 'components', group: 'inspectors', kind: 'component', component: VoiceDesignTraits, examples: [
    {label:'No preference',props:{value:{}}},
    {label:'Mexican Spanish',props:{value:{languageCode:'es-MX',regionCode:'MX',accent:'Mexico City'}}},
    {label:'Locked while generating',props:{value:{languageCode:'es-MX',regionCode:'MX',accent:'Mexico City'},disabled:true}},
  ]},
  {id:'object-appearance-workbench',name:'ObjectAppearanceWorkbench',section: 'screens',group: 'objects',kind:'screen',component:ObjectAppearanceWorkbench,examples:[{label: 'Empty',props:{}},...artworkStates(objectWorkspace,emptyObjectBrief,'chain',objectFigure)]},
  {id:'place-appearance-workbench',name:'PlaceAppearanceWorkbench',section: 'screens',group: 'places',kind:'screen',component:PlaceAppearanceWorkbench,examples:[{label: 'Empty',props:{}},...artworkStates(placeWorkspace,emptyPlaceBrief,'apartment',DEMO_COVER),{label:'Suggestion in progress',props:{workspace:placeWorkspace,brief:emptyPlaceBrief,refining:true}},{label:'Structure first (illustrative: the app composes the floor plan)',props:{workspace:placeWorkspace,brief:emptyPlaceBrief,mode:'structure'},snippets:{structure:[{component:EmptyState,props:{title:'Floor plan',icon:'map-pin'}}]}}]},
  {
    id: 'character-appearance-workbench', name:'CharacterAppearanceWorkbench',section: 'screens',group: 'characters',kind:'screen',component: CharacterAppearanceWorkbench,examples:[
      {label: 'Empty',props:{}},
      {label:'Look proposals with locks',props:{workspace:madisonWorkspace,brief:emptyBrief,look:madisonLook,lookLocks:{form:true,hair:true}}},
      {label:'Generating a sheet',props:{workspace:{...madisonWorkspace,hasActiveJobs:true,jobs:[{id:'job-sheet-1',requestId:'request-sheet-1',state:'running',publication:'pending'}]},brief:emptyBrief,generationRequestId:'request-sheet-1',generationPurpose:'characterSheet',busy:true}},
      {label:'Version ready to review',props:{workspace:{...madisonWorkspace,candidates:[madisonSheet('sheet-2','Sheet two','unreviewed',false),madisonSheet('sheet-1','Sheet one','reviewed',true)],jobs:[{id:'job-sheet-2',requestId:'request-sheet-2',revisionId:'sheet-2',state:'succeeded',publication:'saved'}]},brief:emptyBrief,candidateId:'sheet-1',generationRequestId:'request-sheet-2',generationPurpose:'characterSheet',imageURLs:madisonImageURLs,mediaUrl:madisonFigure}},
      {label:'Unsaved edits',props:{workspace:{...madisonWorkspace,candidates:[madisonSheet('sheet-1','Sheet one','reviewed',true)]},brief:emptyBrief,candidateId:'sheet-1',imageURLs:madisonImageURLs,mediaUrl:madisonFigure,look:madisonLook,dirty:true}},
      {label:'Not ready to generate',props:{workspace:{...madisonWorkspace,generationReady:false},brief:emptyBrief}},    ],
  },
  {
    id: 'shot-inspector', name: 'ShotInspector', section: 'components', group: 'inspectors', kind: 'component', component: ShotInspector, examples: [
      {label: 'No authored shots', props: {shot:null}},
      {label: 'Directed, no frames yet', props: {shot:evictionShot([], ''), sceneLabel:evictionTitle, generationReady:true}},
      {label: 'Frames to review', props: {shot:evictionShot(evictionFrames, 'frame-1'), previewId:'frame-2', sceneLabel:evictionTitle, generationReady:true}},
      {label: 'Generating a frame', props: {shot:evictionShot(evictionFrames.slice(0, 1), 'frame-1'), previewId:'frame-1', sceneLabel:evictionTitle, generationReady:true, busy:true, generating:true}},
      {label: 'Timing unresolved', props: {shot:evictionShot([], '', {start:null, timingStatus:'unresolved'}), sceneLabel:evictionTitle}},
      {label: 'Unsaved direction', props: {shot:evictionShot(evictionFrames.slice(0, 1), 'frame-1'), previewId:'frame-1', sceneLabel:evictionTitle, generationReady:true, dirty:true}},
    ],
  },
  {
    id: 'voice-design-panel', name: 'VoiceDesignPanel',
    section: 'components', group: 'inspectors', kind: 'component', component: VoiceDesignPanel,
    examples: [
      { label: 'Ready', props: { instruct: premiumVoice?.description ?? '', text: '' } },
      { label: 'Generating', props: { instruct: premiumVoice?.description ?? '', text: evictionAction?.text ?? '', result: { src: '', generating: true } } },
    ],
  },
  {
    id: 'voice-clone-panel', name: 'VoiceClonePanel',
    section: 'components', group: 'inspectors', kind: 'component', component: VoiceClonePanel,
    examples: [
      { label: 'Ready', props: { refAudio: '', refText: '', text: '' } },
      { label: 'With engine languages', props: { refAudio: '', refText: '', text: evictionAction?.text ?? '', languages: voiceLanguages } },
      { label: 'Generating', props: { refAudio: '', refText: '', text: evictionAction?.text ?? '', result: { src: '', generating: true } } },
    ],
  },
  {
    id: 'dialogue-composer', name: 'DialogueComposer',
    section: 'components', group: 'inspectors', kind: 'component', component: DialogueComposer,
    examples: [
      { label: 'Ready', props: { script: dialoguesData.slice(0, 3).map((d) => `${d.character}: ${d.text}`).join('\n'), pauseSeconds: 0.5 } },
      { label: 'Empty script', props: { script: '' } },
      { label: 'Generating', props: { script: dialoguesData.slice(0, 3).map((d) => `${d.character}: ${d.text}`).join('\n'), pauseSeconds: 0.5, result: { src: '', generating: true } } },
    ],
  },
  {
    id: 'voice-preset-panel', name: 'VoicePresetPanel',
    section: 'screens', group: 'voicesWindow', kind: 'screen', component: VoicePresetPanel,
    examples: [
      { label: 'Speakers', props: { speakers: [{ id: 'vivian', name: 'Vivian' }, { id: 'ryan', name: 'Ryan' }], ongenerate: () => {} } },
      { label: 'Empty', props: { speakersReason: "khaosd doesn't list its preset speakers yet. Requested." } },
    ],
  },
  {
    id: 'sound-studio', name: 'SoundStudio',
    section: 'screens', group: 'voicesWindow', kind: 'screen', component: SoundStudio,
    // musicLimits is illustrative: the host supplies the engine's own bounds.
    examples: [
      { label: 'Empty', props: { onSfx: () => {}, onMusic: () => {}, musicLimits: { maxDurationSeconds: 90, maxSteps: 12 } } },
      { label: 'With takes', props: {
        onSfx: () => {}, onMusic: () => {}, musicLimits: { maxDurationSeconds: 90, maxSteps: 12 },
        sfxTakes: [
          { id: 's2', label: 'Take 2', createdAt: '2026-09-30T20:02:00Z', voiceName: 'A campfire crackling in a quiet forest at night' },
          { id: 's1', label: 'Take 1', createdAt: '2026-09-30T20:01:00Z', voiceName: 'A campfire crackling in a quiet forest at night' },
        ],
      } },
      { label: 'Engine not ready', props: { onSfx: () => {}, onMusic: () => {}, musicLimits: { maxDurationSeconds: 90, maxSteps: 12 }, sfxReason: 'The sound-effects engine is not running. Start it in Setup.' } },
    ],
  },
  {
    id: 'voice-studio', name: 'VoiceStudio',
    section: 'screens', group: 'voicesWindow', kind: 'screen', component: VoiceStudio,
    examples: [
      { label: 'Empty', props: {} },
      { label: 'Workbench, no takes yet', props: { modes: ['Design', 'Clone'], takes: [], saveReason: 'Generate a take first, so you keep a voice you have heard.' } },
      { label: 'Workbench, auditioning', props: {
        modes: ['Design', 'Clone'],
        takes: [
          { id: 't2', label: 'Take 2', createdAt: '2026-09-30T13:52:00Z', voiceName: 'a strong Black American woman with a commanding…' },
          { id: 't1', label: 'Take 1', createdAt: '2026-09-30T13:50:00Z', voiceName: 'a strong Black American woman with a commanding…' },
        ],
        saveReason: 'khaosd cannot save a voice yet. Saving is requested from the engine.',
      } },
      // D90 lock mode. Illustrative (D62): the vendored data holds no designed voice, so the
      // name and description are made up; the takes are `illustrativeTakes`, speaking
      // Madison's vendored lines: one of a single sentence, and her first, which has three.
      { label: 'Lock, no take yet', props: { lockVoice: lockingVoice, takes: [], onLock: () => {} } },
      { label: 'Lock, auditioning', props: {
        lockVoice: lockingVoice, onLock: () => {}, onChooseTake: () => {},
        takes: takesAfter(2).map((take) => ({ ...take, text: lockLine?.text ?? '' })),
      } },
      { label: 'Lock, a take of several sentences', props: {
        lockVoice: lockingVoice, onLock: () => {},
        takes: takesAfter(1).map((take) => ({ ...take, text: takeLine?.text ?? '' })),
      } },
      { label: 'Lock, already locked', props: {
        lockVoice: { ...lockingVoice, locked: true }, onLock: () => {},
        takes: takesAfter(2).map((take) => ({ ...take, text: lockLine?.text ?? '' })),
      } },
    ],
  },
  {
    id: 'labeled-pill', name: 'LabeledPill', kind: 'component', section: 'components', group: 'labels', component: LabeledPill,
    examples: [
      { label: 'Populated', props: { label: 'Mood', value: 'Skeptical', tone: 'warning' } },
      { label: 'Neutral', props: { label: 'Type', value: 'Protagonist', tone: 'neutral' } },
    ],
  },
  {
    // The inline metadata run (#56, D63). `label` is the point of the atom, not
    // a nicety: Icon is aria-hidden by contract, so an unlabelled item announces
    // a bare value — the "Unlabelled" example is the shape every hand-rolled
    // copy has, sitting one tab away from the labelled one so the difference is
    // audible rather than described.
    //
    // The last two examples are D63's two-strips adoption instruction, which is
    // a footer holding two runs:
    //   <footer class="strip"><MetaStrip items={context}/><MetaStrip items={[time]}/></footer>
    // The registry renders one component per entry, so the composition appears
    // as its two runs on adjacent tabs rather than side by side in one frame.
    id: 'meta-strip', name: 'MetaStrip', kind: 'component', section: 'components', group: 'labels', component: MetaStrip,
    examples: [
      { label: 'Populated', props: { items: metaItems(
        { icon: 'film-slate', label: 'Scene', text: openingSegment.label },
        { icon: 'user', label: 'Character', text: openingSpeaker },
        { label: 'Time', text: `${timecode(44)} / ${timecode(storyDuration)}`, numeric: true },
      ) } },
      { label: 'No icons', props: { items: metaItems(
        { label: 'Scene', text: openingSegment.label },
        { label: 'Character', text: openingSpeaker },
      ) } },
      { label: 'Unlabelled', props: { items: metaItems(
        { icon: 'film-slate', text: openingSegment.label },
        { icon: 'user', text: openingSpeaker },
      ) } },
      { label: 'Two strips · context', props: { items: metaItems(
        { icon: 'film-slate', label: 'Scene', text: openingSegment.label },
        { icon: 'user', label: 'Character', text: openingSpeaker },
      ) } },
      { label: 'Two strips · transport', props: { items: metaItems(
        { label: 'Time', text: `${timecode(44)} / ${timecode(storyDuration)}`, numeric: true },
      ) } },
      { label: 'Empty', props: { items: [] } },
    ],
  },
  {
    id: 'editable-field', name: 'EditableField', kind: 'component', section: 'foundation', group: 'adopted', component: EditableField,
    examples: [
      { label: 'Populated', props: { label: 'Summary', value: 'A courier who stopped counting trips.' } },
      { label: 'Empty', props: { label: 'Summary', value: '' } },
    ],
  },
  {
    id: 'selectable-row', name: 'SelectableRow', kind: 'component', section: 'components', group: 'rows', component: SelectableRow,
    examples: [
      { label: 'Selected', props: { title: 'INT. WAREHOUSE — NIGHT', subtitle: 's1', icon: 'film-slate', selected: true } },
      { label: 'Idle', props: { title: 'EXT. DOCKS — DAY', subtitle: 's2', icon: 'film-slate', selected: false } },
      // The four kinds Review lists, at the sidebar's thumbnail size: one frame,
      // one glyph each. Read them together in light and dark.
      { label: 'Review: character', props: { title: 'MADISON', subtitle: 'In the action', thumb: 'MADISON', thumbKind: 'person' } },
      { label: 'Review: place', props: { title: 'the bedroom', subtitle: 'Mentioned', thumb: 'the bedroom', thumbKind: 'location' } },
      { label: 'Review: object', props: { title: 'vodka', subtitle: 'Mentioned', thumb: 'vodka', thumbKind: 'object' } },
      { label: 'Review: relationship', props: { title: 'Jetta → Madison', subtitle: 'Relationship', thumb: 'Jetta → Madison', thumbKind: 'relation' } },
    ],
  },
  {
    id: 'empty-state', name: 'EmptyState', kind: 'component', section: 'components', group: 'feedback', component: EmptyState,
    examples: [
      { label: 'Populated', props: { title: 'No scenes', description: 'Parse the screenplay to see its scenes here.', icon: 'film-slate' } },
    ],
  },
  {
    id: 'section-header', name: 'SectionHeader', kind: 'component', section: 'components', group: 'labels', component: SectionHeader,
    examples: [
      { label: 'Populated', props: { eyebrow: 'Local engine', title: 'Projects' } },
    ],
  },
  {
    // Brand content, not a building block: KhaosLogo.svelte:2-6 — "The Khaos
    // brand mark ... vendored from khaos-ui/brand ... Do not edit the path."
    // It sat in `atoms` by group membership alone; judged per item it belongs
    // beside the BrandKit.
    //
    // And on the `assets` shelf within it, not with the specimens. Color, Type,
    // Shape and Tokens are views OF the kit — each a predicate over the same
    // token parse. The mark is not a view of anything; it is an artifact the
    // kit ships. It shared a shelf with them only because BrandKit had one.
    id: 'khaos-logo', name: 'KhaosLogo', kind: 'component', section: 'brandkit', group: 'assets', component: KhaosLogo,
    examples: [
      { label: '48', props: { size: 48 } },
      { label: '24', props: { size: 24 } },
    ],
  },
  {
    // The provider marks, on the `assets` shelf for the same reason KhaosLogo is
    // on it: an artifact the kit ships, not a view of the kit. Color, Type and
    // Tokens are each a predicate over the token parse; a logo is not a
    // predicate over anything.
    //
    // A SHEET, not one page per mark — the question anyone opens this to ask is
    // "which providers do we have artwork for", and a page that renders one mark
    // at a time never answers it. Same reasoning IconSheet records for glyphs.
    //
    // One example only. The sheet takes no props: everything it shows is derived
    // from the shipped marks and the live voice capture, so a variant would be a
    // control over nothing.
    id: 'brand-providers', name: 'Providers', kind: 'screen',
    section: 'brandkit', group: 'assets', component: ProviderSheet,
    plays: ['ProviderBadge'],
    examples: [{ label: 'Sheet', props: {} }],
  },
  {
    id: 'gallery', name: 'Gallery', kind: 'component', section: 'components', group: 'media', component: Gallery,
    examples: [
      { label: 'Populated', props: { name: 'Desmond', images: [
        { caption: 'Front', gender: 'male', age: 'adult' },
        { caption: 'Profile', gender: 'male', age: 'adult' },
        { caption: 'Costume', gender: 'male', age: 'adult' },
        { caption: 'Expression', gender: 'male', age: 'adult' },
      ] } },
      { label: 'Empty', props: { images: [] } },
    ],
  },
  {
    id: 'audio-playback', name: 'AudioPlayback', kind: 'component', section: 'components', group: 'media', component: AudioPlayback,
    examples: [
      { label: 'Voice sample', props: { src: premiumVoice?.sampleURL ?? '', label: premiumVoice?.name ?? 'Voice sample' } },
      // The captured take's peaks (data/scene-read.json). Its audio is not committed, so the
      // transport is disabled; the waveform draws behind the scrubber all the same.
      { label: 'With peaks (captured)', props: { src: '', label: sceneReadData.take.label, peaks: sceneReadData.take.peaks } },
      // P1-U4: the peaks read failed and the clip did not. The message is khaosd's own wording
      // for a non-WAV generation (khaos-manager cmd/khaosd/synth.go, AUDIO_NOT_DECODABLE); the
      // audio is the live voice sample, so the transport genuinely plays.
      { label: 'Peaks failed', props: { src: premiumVoice?.sampleURL ?? '', label: premiumVoice?.name ?? 'Voice sample', peaksError: peaksFailure } },
      { label: 'Empty', props: { src: '' } },
    ],
  },
  {
    // Waveform (P1-U1): a recording's peaks as khaosd serves them. The first two are
    // CAPTURED (data/scene-read.json): a scene read's peaks and its last line's take. The
    // third is ILLUSTRATIVE (D62): a v1 document, peaks khaosd never serves — the state
    // a capture cannot reach.
    id: 'waveform', name: 'Waveform', kind: 'component', section: 'components', group: 'media', component: Waveform,
    examples: [
      { label: 'Scene read (captured)', props: { peaks: sceneReadData.readPeaks, from: 0, to: readSeconds } },
      { label: 'Line take (captured)', props: { peaks: sceneReadData.take.peaks, from: 0, to: peakSeconds(sceneReadData.take.peaks) } },
      { label: 'Unreadable peaks', props: { peaks: { version: 1, channels: 1, sample_rate: 24000, samples_per_pixel: 240, bits: 8, length: 0, data: [] }, from: 0, to: 1 } },
    ],
  },
  {
    // The first adopted component — Ark UI's Menu, dressed in BrandKit tokens.
    //
    // It was the shell's workspace switcher; the banner now uses
    // SegmentedControl instead, so Menu is currently on the shelf without an
    // in-app caller. It stays: the shelf records what has been adopted, and
    // removing a working adopted primitive because the shell stopped calling it
    // would make the shelf track usage rather than provenance.
    id: 'menu', name: 'Menu', kind: 'component', section: 'foundation', group: 'adopted', component: Menu,
    examples: [
      { label: 'Workspace', props: {
        label: 'Workspace', value: 'system',
        items: [
          { value: 'system', label: 'System' },
          { value: 'screens', label: 'Screens' },
          { value: 'flows', label: 'Flows' },
          { value: 'playground', label: 'Playground' },
        ],
      } },
      { label: 'Single item', props: {
        label: 'Theme', value: 'dark',
        items: [{ value: 'dark', label: 'Dark' }],
      } },
      // #223 — captured voice data; see the declaration at `menuVoiceItems`.
      { label: 'Grouped by provider', props: {
        label: 'Voice', value: menuFirstVoice('openai'), items: menuVoiceItems,
      } },
      { label: 'Current value unavailable', props: {
        label: 'Voice', value: menuFirstVoice('kittentts'), items: menuVoiceItems,
      } },
      { label: 'Stored value outside items', props: {
        label: 'Voice',
        value: menuStoredElsewhere?.voiceProfileId ?? '',
        currentLabel: menuStoredElsewhere?.voiceProfileName ?? '',
        items: menuVoiceItems,
      } },
      { label: 'Disabled', props: {
        label: 'Voice', value: menuFirstVoice('openai'), items: menuVoiceItems, disabled: true,
      } },
      { label: 'Current value unavailable, no reason', props: {
        label: 'Voice', value: menuFirstVoice('elevenlabs'), items: menuVoiceItems,
      } },
    ],
  },
  {
    // Ark UI's Segment Group. In use as the banner's workspace switcher
    // (App.svelte), so by the same rule that put Menu on the shelf it belongs
    // here too — an adopted primitive the shell depends on, absent from the
    // adopted shelf, would make the catalog understate what it runs on.
    id: 'segmented-control', name: 'SegmentedControl', kind: 'component',
    section: 'foundation', group: 'adopted', component: SegmentedControl,
    examples: [
      { label: 'Workspace', props: {
        label: 'Workspace', value: 'system',
        items: [
          { value: 'system', label: 'System' },
          { value: 'screens', label: 'Screens' },
          { value: 'flows', label: 'Flows' },
          { value: 'playground', label: 'Playground' },
        ],
      } },
      { label: 'Two options', props: {
        label: 'Theme', value: 'dark',
        items: [{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }],
      } },
    ],
  },

  // ---- the nine that had drifted out of the catalog -------------------------
  //
  // Every one of these shipped in the library between 2026-08-14 and 08-16 and
  // never reached this registry: the story-coverage gate watched Storybook and
  // nothing watched the catalog, so `check-stories` stayed green at 37/37 while
  // the catalog sat at 28. `npm run check-catalog` was added as the other half of
  // that pair, and outlived it — Storybook was retired in D61 and this is now the
  // only coverage gate there is.

  {
    // A label above its content. This fixture passes props only, so the slot
    // below the label renders empty and the example is label-only. That is a gap
    // in the fixture, not a limit of the canvas: `snippets.children` is supported
    // (see the Settings examples) and this one could carry a snippet.
    //
    // It said "the composed view is in Storybook" until D61 retired Storybook.
    // There is no composed view anywhere now, which is what makes filling this
    // in worth doing.
    id: 'labeled-field', name: 'LabeledField', kind: 'component', section: 'components', group: 'labels', component: LabeledField,
    examples: [
      { label: 'Labelled', props: { label: 'Logline' } },
      { label: 'No label', props: { label: '' } },
    ],
  },
  {
    // The entity portrait. No `src` in either example on purpose: KSPD stores
    // no reference imagery yet (khaos-parser#40), so the fallback — monogram
    // for a person, icon for a place — is the state the app actually renders.
    id: 'portrait', name: 'Portrait', kind: 'component', section: 'components', group: 'media', component: Portrait,
    examples: [
      { label: 'Person', props: { name: desmond.name, identity: 'Protagonist', kind: 'person' } },
      { label: 'Place', props: { name: locationsData[0]?.name ?? '', identity: 'Location', kind: 'location', aspect: '4 / 3' } },
      { label: 'Object', props: { name: 'vodka', identity: 'Object', kind: 'object' } },
      { label: 'Relationship', props: { name: 'Jetta and Madison', identity: 'Relationship', kind: 'relation' } },
      // #23. The demographics three components passed and this one silently
      // dropped. The kit ships the twelve silhouettes now, so these need no
      // resolver — each sits on its own identity colour, which is why the
      // template survived rather than being replaced.
      { label: 'Figure (male)', props: { name: desmond.name, identity: desmond.id, gender: 'male', age: 'adult' } },
      { label: 'Figure (female)', props: { name: 'Jetta', identity: 'Jetta', gender: 'female', age: 'young' } },
      // 21 of 27 characters in the real data carry no demographics at all, so
      // this is the one seen most.
      { label: 'Figure (unknown)', props: { name: 'Fifth', identity: 'Fifth' } },
      { label: 'App-supplied set', props: { name: desmond.name, identity: desmond.id, gender: 'male', age: 'adult', figureFor: demoFigureFor } },
    ],
  },
  {
    id: 'provider-mark', name: 'ProviderMark',
    kind: 'component', section: 'components', group: 'labels', component: ProviderMark,
    examples: [
      // Resolved by engine id — the #178 split. The label is the caller's
      // problem; this draws the artwork and nothing else.
      { label: 'By id', props: { providerId: 'openai' } },
      { label: 'By name', props: { provider: 'ElevenLabs' } },
      // A provider the kit ships no artwork for. The neutral plug, never an
      // invented brand mark.
      { label: 'No artwork', props: { providerId: 'ollama' } },
      // The case #179 hit: khaosd's title is not a lookup key, so passing it
      // alone draws the placeholder. Passing the id fixes it.
      { label: 'A title is not a key', props: { provider: 'OpenAI Platform' } },
      { label: 'A caller-chosen fallback', props: { providerId: 'suno', fallbackIcon: 'music-notes' } },
    ],
  },
  {
    // Which engine synthesised a voice, and at what tier. Both rows are real
    // entries from the voice catalog (voices.json).
    id: 'provider-badge', name: 'ProviderBadge', kind: 'component', section: 'components', group: 'labels', component: ProviderBadge,
    examples: [
      { label: 'Premium', props: { provider: premiumVoice?.provider ?? '', qualityTier: premiumVoice?.qualityTier ?? '' } },
      { label: 'Standard', props: { provider: standardVoice?.provider ?? '', qualityTier: standardVoice?.qualityTier ?? '' } },
    ],
  },
  {
    // #237. The labels are the review surface's verdict row and the offline
    // banner's remedy (khaos-app review-surface design §5, §8). The kit had no
    // button, so khaos-app drew native ones; these are what they become.
    id: 'button', name: 'Button', kind: 'component', section: 'components', group: 'fields', component: Button,
    examples: [
      { label: 'Primary', props: { variant: 'primary', children: buttonLabel('Bind') } },
      { label: 'Secondary', props: { variant: 'secondary', children: buttonLabel('Leave unresolved') } },
      { label: 'Text', props: { variant: 'text', children: buttonLabel('On-device Engines') } },
      { label: 'Tool', props: { variant: 'tool', icon: 'scissors', title: 'Split selected shot at playhead', children: buttonLabel('Split') } },
      { label: 'Icon', props: { variant: 'secondary', icon: 'arrow-clockwise', children: buttonLabel('Check again') } },
      { label: 'Disabled', props: { variant: 'primary', disabled: true, children: buttonLabel('Bind') } },
      { label: 'Disabled secondary', props: { variant: 'secondary', disabled: true, children: buttonLabel('Refuse this answer') } },
    ],
  },
  {
    // The lists' filter box. `shown`/`total` drive the count caption; both null
    // suppresses it entirely, which is the un-filtered state.
    id: 'filter-field', name: 'FilterField', kind: 'component', section: 'components', group: 'fields', component: FilterField,
    examples: [
      { label: 'Filtering', props: { label: 'Filter scenes', placeholder: 'Filter scenes…', value: 'INT.', shown: scenesData.filter((s) => s.slugline.startsWith('INT.')).length, total: scenesData.length } },
      { label: 'Empty', props: { label: 'Filter scenes', placeholder: 'Filter scenes…', value: '', shown: null, total: null } },
    ],
  },
  {
    // Khaos Cloud's sign-in and account screens. No khaosd data feeds these, so
    // the values are empty and the error and hint text is ILLUSTRATIVE STATE (D62).
    id: 'text-field', name: 'TextField', kind: 'component', section: 'components', group: 'fields', component: TextField,
    examples: [
      { label: 'Email', props: { label: 'Email', type: 'email', name: 'email', autocomplete: 'email', required: true, value: '' } },
      { label: 'With hint', props: { label: 'Display name', name: 'name', autocomplete: 'nickname', hint: 'Shown to collaborators on shared projects.', value: '' } },
      { label: 'Invalid', props: { label: 'Email', type: 'email', name: 'email', autocomplete: 'email', required: true, value: 'k@', error: 'Enter a full email address.' } },
    ],
  },
  {
    // Khaos Cloud's multiline fields. The text is ILLUSTRATIVE STATE (D62).
    id: 'text-area-field', name: 'TextAreaField', kind: 'component', section: 'components', group: 'fields', component: TextAreaField,
    examples: [
      { label: 'Empty', props: { label: 'Notes', name: 'notes', value: '' } },
      { label: 'With hint', props: { label: 'Logline', name: 'logline', rows: 2, hint: 'One or two sentences. Cmd+Enter saves.', value: '' } },
      { label: 'Invalid', props: { label: 'Logline', name: 'logline', rows: 2, required: true, value: '', error: 'Add a logline before saving.' } },
    ],
  },
  {
    id: 'password-field', name: 'PasswordField', kind: 'component', section: 'components', group: 'fields', component: PasswordField,
    examples: [
      { label: 'Sign in', props: { label: 'Password', name: 'password', autocomplete: 'current-password', required: true, value: '' } },
      { label: 'New password', props: { label: 'New password', name: 'password', autocomplete: 'new-password', required: true, hint: 'At least 12 characters.', value: '' } },
      { label: 'Invalid', props: { label: 'New password', name: 'password', autocomplete: 'new-password', required: true, hint: 'At least 12 characters.', value: 'short', error: 'Use at least 12 characters.' } },
    ],
  },
  {
    id: 'code-field', name: 'CodeField', kind: 'component', section: 'components', group: 'fields', component: CodeField,
    examples: [
      { label: 'Empty', props: { label: 'Confirmation code', name: 'code', hint: 'Sent to your email address.', value: '' } },
      { label: 'Part entered', props: { label: 'Authenticator code', name: 'code', value: '418' } },
      { label: 'Invalid', props: { label: 'Confirmation code', name: 'code', value: '418302', error: 'That code has expired. Request a new one.' } },
    ],
  },
  {
    // A form as one column: a form-level message, the fields, the actions.
    id: 'form-stack', name: 'FormStack', kind: 'component', section: 'components', group: 'fields', component: FormStack,
    examples: [
      { label: 'Sign in', props: { label: 'Sign in' },
        snippets: {
          children: [
            { component: TextField, props: { label: 'Email', type: 'email', name: 'email', autocomplete: 'email', required: true, value: '' } },
            { component: PasswordField, props: { label: 'Password', name: 'password', autocomplete: 'current-password', required: true, value: '' } },
          ],
          actions: [{ component: Button, props: { variant: 'primary', type: 'submit', children: buttonLabel('Sign in') } }],
        } },
      { label: 'Rejected', props: { label: 'Sign in' },
        snippets: {
          message: [{ component: OutcomeBanner, props: { tone: 'error', title: 'Could not sign in', detail: 'Incorrect email or password.' } }],
          children: [
            { component: TextField, props: { label: 'Email', type: 'email', name: 'email', autocomplete: 'email', required: true, value: '' } },
            { component: PasswordField, props: { label: 'Password', name: 'password', autocomplete: 'current-password', required: true, value: '' } },
          ],
          actions: [{ component: Button, props: { variant: 'primary', type: 'submit', children: buttonLabel('Sign in') } }],
        } },
    ],
  },
  {
    id: 'speech-controls', name: 'SpeechControls', kind: 'component', section: 'components', group: 'fields', component: SpeechControls,
    examples: [
      { label: 'Defaults', props: { temperature: 0.9, topK: 50, topP: 1, repetitionPenalty: 1.05 } },
      { label: 'At the limits', props: { temperature: 2, topK: 1, topP: 0, repetitionPenalty: 2 } },
    ],
  },
  {
    id: 'speaker-picker', name: 'SpeakerPicker', kind: 'component', section: 'components', group: 'fields', component: SpeakerPicker,
    examples: [
      { label: 'Selected', props: { speakers: presetSpeakers, selected: 'aiden' } },
      { label: 'None', props: { speakers: presetSpeakers, selected: '' } },
      // ILLUSTRATIVE STATE — D62. A host holding the picker while a choice is
      // written (#264). Only `disabled` / `pendingId` are set; the speakers are
      // the same list as above.
      { label: 'Disabled', props: { speakers: presetSpeakers, selected: 'aiden', disabled: true } },
      { label: 'Choice in flight', props: { speakers: presetSpeakers, selected: 'aiden', pendingId: 'serena' } },
    ],
  },
  {
    // D88. The codes khaosd 0.61.0 lists for voice design.
    id: 'language-picker', name: 'LanguagePicker', kind: 'component', section: 'components', group: 'fields', component: LanguagePicker,
    examples: [
      { label: 'Detect', props: { languages: ['auto', 'en', 'de', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'], value: 'auto' } },
      { label: 'Chosen', props: { languages: ['auto', 'en', 'de', 'ja'], value: 'ja' } },
    ],
  },
  {
    // The composition timeline (khaos.machine.x M4).
    //
    // Real BROKEN IN 4 PLACES composition — 54 segments, the same project as the
    // rest of src/data, so the timeline and the scene list finally describe one
    // screenplay.
    //
    // It briefly was NOT. Earlier on 2026-08-16 every project on the daemon
    // returned `{"segments":[]}`, so this file held a capture of "Heart of an
    // Indie" instead, and the fixture said so. fetch-kspd.sh writes this file
    // only when the daemon returns segments — which is what let it upgrade to
    // the real thing on the next run rather than being blanked on the first one.
    id: 'story-player', name: 'StoryPlayer', kind: 'screen', section: 'screens', group: 'storyPlayer', component: StoryPlayer,
    // The committed capture predates RFC 0069, so its screen-time values were migrated
    // mechanically: seconds became integer milliseconds and cumulative startMs was added.
    // No story content was authored; durationMs and startMs are now the only screen-time
    // keys, and StoryPlayer performs the one projection into playback seconds.
    examples: [
      { label: 'Captured composition', props: { segments: compositionData.segments, currentTime: 0, playing: false, scale: 10 } },
      { label: 'Empty', props: { segments: [], currentTime: 0, playing: false, scale: 10 } },
      // P1-U3: one captured scene read (data/scene-read.json) — each line at the startMs the
      // joiner recorded, pauses kept, each block drawing its stretch of the read's peaks.
      { label: 'Scene read (captured)', props: { segments: [sceneReadSegment], peaks: sceneReadData.readPeaks, lanes: ['action', 'dialogue'], currentTime: 0, playing: false, scale: 100, minScale: 20, maxScale: 400 } },
      { label: 'Audio-led read track (captured)', props: { segments: [sceneReadSegment], waveforms: { [sceneReadSegment.sceneId]: { state: 'ready', peaks: sceneReadData.readPeaks } }, audioEmphasis: true, lanes: ['action', 'dialogue'], currentTime: 0, playing: false, scale: 40 } },
      { label: 'Scene read at 400 px/s', props: { segments: [sceneReadSegment], peaks: sceneReadData.readPeaks, lanes: ['action', 'dialogue'], currentTime: 0, playing: false, scale: 400, minScale: 20, maxScale: 400 } },
    ],
  },
  {
    id: 'story-playback', name: 'StoryPlayback', kind: 'screen', section: 'screens', group: 'storyPlayer', component: StoryPlayback,
    examples: [
      { label: 'The opening read, a line on the stage (captured)', props: { ...playbackProps }, snippets: playbackSnippets },
      { label: 'Between lines (captured)', props: { ...playbackProps, focus: null }, snippets: playbackSnippets },
      { label: 'A scene with no reading chosen (captured)', props: { ...playbackProps, current: unreadScene, focus: null }, snippets: playbackSnippets },
      { label: 'Focus mode', props: { ...playbackProps, focusMode: true }, snippets: playbackSnippets },
      { label: 'Text preview', props: { ...playbackProps, textPreview: true }, snippets: { preview: [{ component: Player, props: { ...playerProps, active: false } }] } },
      { label: 'Could not open (illustrative message)', props: { state: { kind: 'failed', message: 'Some scenes have no resolved playback time yet. Text preview is still available.' }, onPreviewText: () => {} } },
      { label: 'Opening', props: { state: { kind: 'loading' } } },
      { label: 'Empty', props: { state: { kind: 'loaded' }, segments: [] } },
    ],
  },
  {
    id: 'player', name: 'Player', kind: 'screen', section: 'screens', group: 'storyPlayer', component: Player,
    examples: [
      { label: 'The opening scene (captured)', props: { ...playerProps } },
      { label: 'Another scene inspected while the opening plays', props: { ...playerProps, selectedSceneIndex: 1, inspected: playerTimeline.segments[1] ?? null, sceneText: { kind: 'loading' } } },
      { label: 'Between beats', props: { ...playerProps, focus: null, activeCharacterName: '' } },
      { label: 'No composition yet', props: { state: { kind: 'uncomposed' } } },
      { label: 'Could not read (illustrative message)', props: { state: { kind: 'failed', message: 'khaosd is not running.' } } },
      { label: 'Loading', props: { state: { kind: 'loading' } } },
      { label: 'Empty', props: { state: { kind: 'loaded' }, segments: [], timeline: buildTimeline([]) } },
    ],
  },
  {
    id: 'composer', name: 'Composer', kind: 'component', section: 'screens', group: 'storyPlayer', component: Composer,
    // Each part draws a kit component whose own fixture shows its states; these show the parts,
    // with the shot data those fixtures use.
    examples: [
      { label: 'Stage: the previs (kit v0.8.0 build)', props: { part: 'stage', view: 'previs', previs: { ...shotPrevisScene, shot: previsShot } } },
      { label: 'Stage: the chosen frame', props: { part: 'stage', view: 'rendered', stage: { key: 'shot-1:frame-1', shot: evictionShot(evictionFrames, 'frame-1'), imageUrl: madisonFigure, review: 'Chosen frame', event: { label: 'Action', text: evictionAction?.text ?? '' } } } },
      { label: 'Planning', props: { part: 'planning', planner: { beatCount: evictionEvents.length, plan: evictionPlan, sceneLabel: evictionTitle } } },
      { label: 'Scene, with timing review', props: { part: 'scene', timing: { repair: null }, planner: { inspector: true, beatCount: evictionEvents.length, sceneLabel: evictionTitle } } },
      { label: 'Tools: a shot with frames', props: { part: 'tools', timing: { repair: null }, moderation: { value: 'auto', onchange: () => {} }, inspector: { shot: evictionShot(evictionFrames, 'frame-1'), previewId: 'frame-2', sceneLabel: evictionTitle, generationReady: true } } },
      { label: 'Tools: generating', props: { part: 'tools', moderation: { value: 'low', disabled: true }, phase: 'Generating frame 1 of 2…', inspector: { shot: evictionShot(evictionFrames.slice(0, 1), 'frame-1'), sceneLabel: evictionTitle, generationReady: true, consent: true, busy: true, generating: true } } },
      { label: 'Empty', props: { part: 'stage', stage: null } },
    ],
  },
  {
    // Ark UI's Switch — the first control in the kit that turns a setting on or
    // off. Adopted, so it sits on the adopted shelf with Menu and
    // SegmentedControl rather than among the authored atoms.
    id: 'toggle', name: 'Toggle', kind: 'component', section: 'foundation', group: 'adopted', component: Toggle,
    examples: [
      { label: 'On, with a hint', props: { label: 'Restore last project', hint: 'Reopens the project you were last in.', checked: true } },
      { label: 'Off', props: { label: 'Start khaosd at login', checked: false } },
      // khaos-app's first Settings slice shows engine state it cannot yet change,
      // so live and disabled toggles appear on the same screen (#18).
      { label: 'Disabled', props: { label: 'Route analysis through Ollama', hint: 'Engine settings are read-only until that path is opened.', checked: true, disabled: true } },
    ],
  },
  {
    id: 'story-atlas', name: 'StoryAtlas', kind: 'screen', section: 'screens', group: 'storyAtlas', component: StoryAtlas,
    // The canvas positions itself inside the atlas and has no size of its own, so it is shown here,
    // drawing the captured graph, rather than alone in an empty frame.
    plays: ['StoryAtlasCanvas'],
    examples: [
      { label: 'Everything (captured)', props: { ...atlasProps } },
      { label: 'Characters (captured)', props: { ...atlasProps, lens: 'character' } },
      { label: 'Madison selected (captured)', props: { ...atlasProps, selectedRecordId: charactersDestination.focus.id, portraitUrls: { [charactersDestination.focus.id]: madisonFigure } } },
      { label: 'Renderer diagnostics', props: { ...atlasProps, diagnostics: true } },
      { label: 'Activity open (illustrative job)', props: { ...atlasProps, activityOpen: true, jobs: [{ id: 'job_1', type: 'scene analysis', status: 'running', progress: { completed: 12, total: 57 } }], activity: { kind: 'missing' } } },
      { label: 'Reading', props: { atlas: null, refreshing: true } },
      { label: 'Could not read (illustrative message)', props: { atlas: null, error: 'The story could not be read: khaosd is not running.', onRetry: () => {} } },
      { label: 'Empty', props: { atlas: null } },
    ],
  },
  {
    id: 'story-atlas-toolbar', name: 'StoryAtlasToolbar', kind: 'component', section: 'screens', group: 'storyAtlas', component: StoryAtlasToolbar,
    emptyNotApplicable: 'A toolbar always offers its lenses. With no graph it is disabled, which the Unavailable example shows.',
    examples: [
      { label: 'Everything', props: { lens: 'all' } },
      { label: 'With Recenter', props: { lens: 'all', onRecenter: () => {} } },
      { label: 'Scenes', props: { lens: 'scene' } },
      { label: 'Unavailable', props: { disabled: true } },
    ],
  },
  {
    id: 'story-atlas-relationship', name: 'StoryAtlasRelationship', kind: 'component', section: 'screens', group: 'storyAtlas', component: StoryAtlasRelationship,
    examples: [
      { label: 'Shared scenes', props: {
        source: { id: storyGraphData.edges[0].a, label: storyGraphData.edges[0].a_name, kind: 'character' },
        target: { id: storyGraphData.edges[0].b, label: storyGraphData.edges[0].b_name, kind: 'character' },
        label: 'Shared scenes', evidence: String(storyGraphData.edges[0].weight) + ' shared scenes',
      } },
      { label: 'Empty', props: {} },
    ],
  },
  {
    id: 'measure-table', name: 'MeasureTable',
    kind: 'component', section: 'components', group: 'charts', component: MeasureTable,
    examples: [
      // Straight off the live capture. Three measures whose ranges differ by two
      // orders of magnitude — words run to 4024, scenes to 29 — which is the
      // case that makes one shared scale unreadable and per-column
      // normalisation the point rather than a detail.
      { label: 'Populated', props: {
        rows: characters.map((c) => ({ label: c.name, ...c })),
        measures: MEASURE_COLUMNS,
        caption: 'Characters by dialogue, words and scenes',
      } },
      // One row carried, the rest as context — what a workspace overview wants
      // when something is selected beside it.
      { label: 'Emphasis', props: {
        rows: characters.map((c) => ({ label: c.name, ...c })),
        measures: MEASURE_COLUMNS,
        selectedKey: 'Desmond',
        caption: 'Desmond against the rest of the cast',
      } },
      // Host-owned sort, the same controlled/uncontrolled split #171 gave the
      // workspaces: a host that must fetch or paginate needs the order before
      // the table renders it.
      { label: 'Sorted by the host', props: {
        rows: characters.map((c) => ({ label: c.name, ...c })),
        measures: MEASURE_COLUMNS,
        sortKey: 'word_count', sortDir: 'desc',
        caption: 'Sorted by word count, owned by the caller',
      } },
      // An absent measure renders as an em dash, never as a zero. A character
      // nobody counted is not a character who said nothing. Illustrative under
      // D62: real names and real shapes, one field withheld.
      { label: 'A measure not taken', props: {
        rows: [
          { label: 'Desmond', dialogue_lines: 297, word_count: 4024, scene_count: 29 },
          { label: 'Jetta', dialogue_lines: 241, scene_count: 22 },
          { label: 'Nacho', dialogue_lines: 10, word_count: 112, scene_count: 2 },
        ],
        measures: MEASURE_COLUMNS,
        caption: 'Jetta has no word count',
      } },
      { label: 'Empty', props: { rows: [], measures: MEASURE_COLUMNS } },
    ],
  },
  {
    // A ranked categorical bar chart (#28). Hand-rolled after prototyping the
    // same chart on LayerCake: 70 lines / 15,133 B against 79 lines / 32,599 B
    // and nine transitive d3 packages, because LayerCake is headless and you
    // still draw every rectangle. The comparison is on the issue.
    //
    // Every example counts real committed data. khaos-app confirmed these three
    // cases are the whole bar-chart need; the pacing series they raised
    // afterwards is a different animal and is still open.
    id: 'bar-chart', name: 'BarChart', kind: 'component', section: 'components', group: 'charts', component: BarChart,
    examples: [
      { label: 'Time of day', props: { data: timeOfDay, caption: 'Scenes by time of day' } },
      { label: 'Scene type', props: { data: sceneType, caption: 'Scenes by type' } },
      { label: 'Occupants', props: { data: occupants, caption: 'Scenes per character' } },
      // No axis, no zero bars — a zeroed chart reads as a measurement of nothing
      // rather than an absence of measurement.
      { label: 'Empty', props: { data: [], emptyLabel: 'This project has not been analysed yet.' } },
    ],
  },
  {
    // The on-device engines. `servicesData` is a live capture of
    // `GET /api/services` — real names and descriptions, which only exist because
    // khaos-manager#147 shipped today. Before that every client rendered raw ids.
    //
    // Read-only is the default example because that is where khaos-app sits: the
    // controls are present and disabled, since a missing control reads as "the
    // product cannot do this" and only "not for you right now" is true.
    id: 'service-status-list', name: 'ServiceStatusList', kind: 'component', section: 'components', group: 'lists', component: ServiceStatusList,
    examples: [
      { label: 'Read-only', props: { services: servicesData } },
      { label: 'Operable', props: { services: servicesData, onStart: () => {}, onStop: () => {} } },
      // THE ROWS BELOW ARE ILLUSTRATIVE, NOT CAPTURED — a declared exception to
      // the real-data rule, scoped to these state-matrix rows and to nothing
      // else. They exist to render states the machine is not in. `orpheus` and
      // `whisper` were already such rows, added for #49; `piper` and the state
      // spread extend them for #43 gap 3 and #51. Five rows, five states, one
      // rendering each. `services.json` is the live capture (three engines,
      // all `stopped`, none errored) and is untouched.
      //
      // The failure sentences are INSTANTIATED FROM THE DAEMON'S OWN format
      // string (khaos-manager lifecycle.go:152), not invented prose: real
      // wording, real shape, no capture claimed.
      { label: 'Every state', props: {
        services: [
          { ...servicesData[0], state: 'running' },
          { ...servicesData[1], state: 'starting' },
          // `stopping` is the state that had no name (#51): folded to
          // `running` it claims an engine is up while it is shutting down.
          { ...servicesData[2], state: 'stopping' },
          { id: 'whisper', name: 'Whisper', description: 'Not installed on this machine', state: 'stopped', port: 8400, provisioned: false },
          // Provisioned and stopped — the plain state, and the one the matrix
          // lost when `stopping` took the third real engine's slot. It reads
          // differently from `whisper` directly above it: same `state`, but
          // `provisioned: true`, so this row offers Start where that one needs
          // setup. Both are `stopped`; only one of them is usable.
          { id: 'piper', name: 'Piper', description: 'Installed, not running', state: 'stopped', port: 8600, provisioned: true },
          {
            id: 'orpheus', name: 'Orpheus TTS', description: 'Failed its last health check',
            state: 'error', port: 8500, provisioned: true,
            reason: 'orpheus did not become healthy on port 8500 within 1m30s — the process likely crashed on launch; see /Users/k/.khaos/logs/orpheus.log',
            log_path: '/Users/k/.khaos/logs/orpheus.log',
          },
        ],
        onStart: () => {}, onStop: () => {}, onSetup: () => {},
      } },
      // #43 gap 3, the three shapes the detail block has to hold: the daemon's
      // own sentence, which already ends in the log path (so the labelled log
      // line is suppressed rather than printing one path twice); a reason that
      // does not mention the path (both lines render); and a log path with no
      // reason at all, which is reachable because `Reason` is set only when the
      // service-map lookup succeeds while `LogPath` is unconditional.
      { label: 'Errored', props: {
        services: [
          {
            id: 'orpheus', name: 'Orpheus TTS', description: 'Failed its last health check',
            state: 'error', port: 8500, provisioned: true,
            reason: 'orpheus did not become healthy on port 8500 within 1m30s — the process likely crashed on launch; see /Users/k/.khaos/logs/orpheus.log',
            log_path: '/Users/k/.khaos/logs/orpheus.log',
          },
          {
            ...servicesData[1], state: 'error',
            reason: 'magenta-rt requires Apple silicon; this host reports x86_64',
            log_path: '/Users/k/.khaos/logs/magenta-rt.log',
          },
          { ...servicesData[0], state: 'error', log_path: '/Users/k/.khaos/logs/kittentts.log' },
        ],
        onStart: () => {}, onStop: () => {}, onSetup: () => {},
      } },
      // #49: the two states a consumer could not express. `Whisper` is
      // unprovisioned, so Setup is primary and Start sits disabled behind it;
      // `kittentts` is mid-flight, so its row is inert and names the verb.
      { label: 'Needs setup', props: {
        services: [
          { id: 'whisper', name: 'Whisper', description: 'Not installed on this machine', state: 'stopped', provisioned: false },
          { ...servicesData[0], state: 'stopped' },
        ],
        onStart: () => {}, onStop: () => {}, onSetup: () => {},
      } },
      { label: 'Action in flight', props: {
        services: [
          { ...servicesData[0], state: 'stopped' },
          { id: 'whisper', name: 'Whisper', description: 'Not installed on this machine', state: 'stopped', provisioned: false },
        ],
        pendingId: servicesData[0]?.id,
        onStart: () => {}, onStop: () => {}, onSetup: () => {},
      } },
      { label: 'Empty', props: { services: [] } },
    ],
  },
  {
    // Ark UI's Dialog. On the adopted shelf with Menu, SegmentedControl and
    // Toggle — the focus trap, Escape, focus restore and ARIA wiring are all
    // the primitive's.
    //
    // Every example names its target. The two projects on the daemon that share
    // the title "TURTLE ISLAND'S TOP CLASS CLOWN" are why that is a requirement
    // and not a nicety: "Delete this project?" would be genuinely ambiguous
    // between them, not merely vague.
    id: 'confirm-dialog', name: 'ConfirmDialog', kind: 'component', section: 'foundation', group: 'adopted', component: ConfirmDialog,
    examples: [
      { label: 'Destructive', props: { open: true, action: 'Delete', target: 'BROKEN IN 4 PLACES', description: 'The .kspd file is removed from disk. This cannot be undone.' } },
      { label: 'Long target', props: { open: true, action: 'Delete', target: 'Heart of an Indie: Ignited by Story Intelligence' } },
      { label: 'Non-destructive', props: { open: true, action: 'Publish', target: 'Breaking Even', tone: 'default' } },
      { label: 'Closed', props: { open: false, target: 'BROKEN IN 4 PLACES' } },
    ],
  },
  {
    // The outcome of a mutation. The failure examples carry REAL khaosd error
    // envelope messages — `projectPath query param required` is what the daemon
    // actually returns — because the component exists to show the engine's own
    // words, and a fixture with an invented error would be demonstrating the
    // opposite of the point.
    id: 'outcome-banner', name: 'OutcomeBanner', kind: 'component', section: 'components', group: 'feedback', component: OutcomeBanner,
    examples: [
      { label: 'Success', props: { tone: 'success', title: 'Project deleted' } },
      { label: 'Failure', props: { tone: 'error', title: 'Could not delete project', detail: 'projectPath query param required' } },
      { label: 'Long engine message', props: { tone: 'error', title: 'Could not open project', detail: 'failed to open project at /Users/k/khaos/projects/broken in 4 places.kspd: the .kspd directory exists but contains no info.json, so it cannot be read as a project' } },
      { label: 'Not dismissible', props: { tone: 'error', title: 'Engine unreachable', detail: 'connection refused', dismissible: false } },
    ],
  },
  {
    // The store row (D77), for khaos-app's Setup surface. ILLUSTRATIVE, NOT CAPTURED
    // (D62): every row is in the shape a host projects an engine payload onto, reusing
    // the names the `requirement-list` entry above already carries. No row is a claim
    // about any machine.
    //
    // Inert in the catalog: no `onInstall` is passed, so every capsule is disabled,
    // which is also the state a consumer is in before its engine serves an install
    // route. The right edge is still filled on every row, which is the point.
    id: 'install-list', name: 'InstallList', kind: 'component', section: 'components', group: 'lists', component: InstallList,
    examples: [
      { label: 'Every state', props: { label: 'System tools', installable: ['wget', 'brew', 'ffmpeg'], items: [
        { id: 'git', name: 'git', tagline: 'Project version control', state: 'installed', required: true, caption: '2.55.0' },
        { id: 'wget', name: 'wget', tagline: 'Asset download fallback', state: 'available' },
        { id: 'brew', name: 'brew', tagline: 'Package manager', state: 'update', required: true, caption: '6.0.18' },
        { id: 'pdftotext', name: 'pdftotext', tagline: 'PDF screenplay import', state: 'unknown' },
        { id: 'khaos-tools', name: 'khaos-tools', tagline: 'Analysis engine', state: 'available', required: true, caption: 'Installed with Khaos Machine' },
        { id: 'ffmpeg', name: 'ffmpeg', tagline: 'Audio export', state: 'available', failure: 'Error: ffmpeg: no bottle available!' },
      ] } },
      { label: 'One installing', props: { label: 'System tools', installable: ['wget', 'ffmpeg'], items: [
        { id: 'wget', name: 'wget', tagline: 'Asset download fallback', state: 'available', installing: true },
        { id: 'ffmpeg', name: 'ffmpeg', tagline: 'Audio export', state: 'available' },
      ] } },
      // Nothing reported is NOT nothing to install, and the copy has to say so.
      { label: 'Nothing reported', props: { items: [] } },
    ],
  },
  {
    id: 'scene-read-status', name: 'SceneReadStatus', kind: 'component', section: 'components', group: 'feedback', component: SceneReadStatus,
    examples: [
      { label: 'No captured workflow', props: {} },
      { label: 'Reading', props: { workflow: sceneWorkflow('running', { total: 12, reused: 2, completed: 5, remaining: 5 }, { allowed: false, reason: 'This workflow cannot resume in its current state.' }) } },
      { label: 'Stopped part way, can resume', props: { workflow: sceneWorkflow('partial', { total: 12, reused: 2, completed: 7, remaining: 3 }, { allowed: true }) } },
      { label: 'Resuming', props: { workflow: sceneWorkflow('partial', { total: 12, reused: 2, completed: 7, remaining: 3 }, { allowed: true }), resuming: true } },
      { label: 'Completed', props: { workflow: sceneWorkflow('completed', { total: 12, reused: 2, completed: 10, remaining: 0 }, { allowed: false, reason: 'This workflow cannot resume in its current state.' }) } },
      { label: 'Retired', props: { workflow: sceneWorkflow('retired', { total: 12, reused: 2, completed: 4, remaining: 6 }, { allowed: false, reason: 'This workflow has been retired.' }) } },
    ],
  },
  {
    // One dialogue line's takes, for khaos-app#185's DialogueInspector. A pure
    // view: the app passes the engine's answer in and receives intent back.
    // The nine states are the plan's (khaos.machine docs/plans/2026-09-28-
    // dialogue-takes.md, U1). The take data is illustrative — see
    // `illustrativeTakes` above for what is real and what is not.
    id: 'take-list', name: 'TakeList', kind: 'component', section: 'components', group: 'lists', component: TakeList,
    examples: [
      { label: 'Empty', props: { takes: [], ...takeHandlers } },
      { label: 'One take', props: { takes: takesAfter(1), ...takeHandlers } },
      // Take 3 chosen: a choice is not the newest take by default.
      { label: 'Many takes', props: { takes: takesAfter(6), chosenId: takesAfter(6)[3].id, ...takeHandlers } },
      { label: 'Generating', props: { takes: takesAfter(2), generating: true, ...takeHandlers } },
      { label: 'Uncast', props: { takes: takesAfter(2), disabledReason: uncastReason, ...takeHandlers } },
      // Every v2 package shows this: every take route answers 409
      // PACKAGE_NOT_TRANSACTIONAL (the plan's red-team High 4), the listing
      // included, so there are never takes beside the reason.
      { label: "Package can't hold takes", props: { takes: [], disabledReason: noTakesReason, ...takeHandlers } },
      // P1-U4: Take 2's peaks failed. Its player stays and plays; the row offers no Try again.
      { label: 'Peaks failed on a row', props: { takes: takesAfter(3).map((t, i) => (i === 1 ? { ...t, peaksError: peaksFailure } : t)), ...takeHandlers, onRetry: () => {} } },
      { label: 'Engine error on a row', props: { takes: takesAfter(3).map((t, i) => (i === 1 ? { ...t, src: '', error: takeConflict } : t)), chosenId: takesAfter(3)[2].id, ...takeHandlers } },
      { label: 'Chosen', props: { takes: takesAfter(3), chosenId: takesAfter(3)[1].id, ...takeHandlers } },
      { label: 'Takes, none chosen', props: { takes: takesAfter(3), ...takeHandlers } },
      // #273: the host is saving Take 2's audio; that row's Download is busy until it clears.
      { label: 'Downloading', props: { takes: takesAfter(3), downloadingId: takesAfter(3)[1].id, ...takeHandlers } },
    ],
  },
  {
    // The acquisition script. There is no Run button and there is not meant to
    // be one: the operator reads it and runs it in a shell they control.
    //
    // The 'Trojan Source' example is the reason this component is not a <pre>.
    // It carries U+202E (RIGHT-TO-LEFT OVERRIDE), which reorders the rendering
    // without changing the bytes — the pane shows it as a code point and
    // refuses the copy, because a script we cannot render truthfully is not one
    // to hand to a shell.
    id: 'install-script', name: 'InstallScript', kind: 'component', section: 'components', group: 'feedback', component: InstallScript,
    examples: [
      { label: 'Homebrew', props: { manager: 'Homebrew', script: 'brew install wget jq\nbrew upgrade ollama', onCopy: () => {} } },
      { label: 'apt', props: { manager: 'apt', script: 'sudo apt-get update\nsudo apt-get install -y wget jq poppler-utils', onCopy: () => {} } },
      // No `onCopy`: the control is present and inert, not absent.
      { label: 'Copy not wired', props: { manager: 'Homebrew', script: 'brew install wget jq' } },
      { label: 'Trojan Source', props: { manager: 'Homebrew', script: 'brew install jq ‮# gnitset ylno', onCopy: () => {} } },
      { label: 'Nothing to install', props: { script: '' } },
    ],
  },
  {
    // The surface for a long-running verb — khaosd's setup endpoint blocks for
    // up to five minutes while it streams a provision log and emits discrete
    // step events.
    //
    // WHICH SIDE OF THE REAL-DATA RULE EACH PROP IS ON, stated because the two
    // halves differ:
    //
    // `steps` IS REAL, read from `data/services.json` — the live capture of
    // GET /api/services carries genuine `setup_steps` on every entry, with real
    // interpreter paths and real venv locations.
    //
    // `lines` IS HAND-AUTHORED. No provisioning log is captured — `fetch-all.sh`
    // fetches none (it runs fetch-kspd.sh and fetch-voices.sh and nothing else)
    // and none exists in `src/data/`. Capturing one needs a daemon caught
    // mid-provision, which is not a state that can be requested. Same standing
    // as `InstallScript`'s `script` (fixtures.js:1541-1546), which is
    // hand-written for the same reason. The rule's distinction is between
    // fabricating a FACT ABOUT THE SYSTEM and supplying representative INPUT to
    // a renderer; a transcript passed in as a prop is the second.
    //
    // NO `failed` EXAMPLE FROM REAL DATA, and that is a gap rather than an
    // omission: `services.json` records only `passed`. Inventing a failure
    // reason khaosd never emitted would be exactly the fabrication the rule
    // forbids. The unrecognised-state example below exercises the neutral
    // branch, which is a RENDERING case and not a claim about the daemon.
    id: 'setup-progress', name: 'SetupProgress', kind: 'component', section: 'components', group: 'feedback', component: SetupProgress,
    examples: [
      { label: 'Provisioning', props: {
        title: 'Provisioning MLX Audio',
        note: 'This may take a few minutes. Do not close the app.',
        busy: true,
        steps: servicesData.find((s) => s.id === 'mlx-audio')?.setup_steps ?? [],
        lines: [
          'Using CPython 3.12.7 interpreter at: /opt/homebrew/bin/python3.12',
          'Creating virtual environment at: /Users/k/.khaos/mlx-audio/venv',
          'Resolved 41 packages in 812ms',
          'Downloading mlx-audio (18.4MiB)',
        ],
        onToggle: () => {},
      } },
      // Expanded — the proof. Collapsed the operator gets a calm screen.
      { label: 'Transcript open', props: {
        title: 'Provisioning MLX Audio',
        busy: true,
        steps: servicesData.find((s) => s.id === 'mlx-audio')?.setup_steps ?? [],
        lines: [
          'Using CPython 3.12.7 interpreter at: /opt/homebrew/bin/python3.12',
          'Creating virtual environment at: /Users/k/.khaos/mlx-audio/venv',
          'Resolved 41 packages in 812ms',
          'Downloading mlx-audio (18.4MiB)',
          'Downloading numpy (5.2MiB)',
          'Installed 41 packages in 1.93s',
        ],
        open: true,
        onToggle: () => {},
      } },
      // The shortest real step list in the capture — kittentts has no
      // apple_silicon step, because it runs on CPU.
      { label: 'Fewer steps', props: {
        title: 'Provisioning KittenTTS',
        steps: servicesData.find((s) => s.id === 'kittentts')?.setup_steps ?? [],
        lines: ['Resolved 12 packages in 214ms'],
        onToggle: () => {},
      } },
      // A state this build has never heard of. StepState is open at the
      // producer, and an unrecognised member must render neutral — not a pass
      // and not a failure.
      { label: 'Unrecognised state', props: {
        title: 'Provisioning MLX Audio',
        steps: [
          { name: 'python', state: 'passed', detail: '3.12 (/opt/homebrew/bin/python3.12)' },
          { name: 'venv', state: 'passed', detail: '/Users/k/.khaos/mlx-audio/venv' },
          { name: 'packages', state: 'quarantined' },
          { name: 'weights' },
        ],
        onToggle: () => {},
      } },
      // Nothing emitted is NOT finished, and the copy has to say so.
      { label: 'Nothing emitted yet', props: {
        title: 'Provisioning MLX Audio',
        busy: true,
        steps: [],
        lines: [],
        open: true,
        onToggle: () => {},
      } },
      // No `onToggle`: the control is present and inert, not absent.
      { label: 'Disclosure not wired', props: {
        title: 'Provisioning MLX Audio',
        steps: servicesData.find((s) => s.id === 'magenta-rt')?.setup_steps ?? [],
        lines: ['Resolved 63 packages in 1.4s'],
      } },
      // Chrome dropped for a full-window mount. The TAKEOVER is the host's —
      // this component owns no viewport and starts no mode (D73).
      { label: 'Surface', props: {
        title: 'Provisioning Magenta RT',
        note: 'This may take a few minutes. Do not close the app.',
        busy: true,
        steps: servicesData.find((s) => s.id === 'magenta-rt')?.setup_steps ?? [],
        lines: ['Resolved 63 packages in 1.4s'],
        variant: 'surface',
        onToggle: () => {},
      } },
    ],
  },
  {
    // Dock (data-layer plan K1; audit §3.2, §4.1). A split-or-tab-group tree as data.
    // The inspector sits in a tab group with Activity, so the strip shows; every other
    // group holds one panel and draws none.
    id: 'dock', name: 'Dock', kind: 'component', section: 'components', group: 'shell', component: Dock,
    examples: [
      { label: 'Story preset', props: { layout: dockStory, panels: dockPanels, panel: dockPanel } },
      { label: 'Inspector collapsed', props: { layout: { ...dockStory, children: [dockStory.children[0], { ...dockStory.children[1], collapsed: true }] }, panels: dockPanels, panel: dockPanel } },
    ],
  },
  {
    // SourceList (data-layer plan K2; audit §4.1). The window's sidebar.
    id: 'source-list', name: 'SourceList', kind: 'component', section: 'components', group: 'shell', component: SourceList,
    examples: [
      { label: 'Story', props: { sections: sourceSections, active: 'characters', label: 'Story destinations' } },
      { label: 'Review active, no count', props: { sections: sourceSections, active: 'review', label: 'Story destinations' } },
    ],
  },
  {
    // WorkspaceSwitcher (data-layer plan K3; audit §3.2). Segmented at full width, a
    // pop-up button below `compactBelow`; the width is the room a toolbar gives it.
    id: 'workspace-switcher', name: 'WorkspaceSwitcher', kind: 'component', section: 'components', group: 'shell', component: WorkspaceSwitcher,
    examples: [
      { label: 'Full width', props: { modes: workspaceModes, value: 'story', width: 900 } },
      { label: 'Minimum width', props: { modes: workspaceModes, value: 'cast', width: 300 } },
    ],
  },
  {
    // Toolbar (data-layer plan K4; audit §1.4, §4.1). The window's one bar.
    id: 'toolbar', name: 'Toolbar', kind: 'component', section: 'components', group: 'shell', component: Toolbar,
    examples: [
      { label: 'Story at 1200', props: { title: 'BROKEN IN 4 PLACES', modes: workspaceModes, mode: 'story', commands: toolbarCommands, panes: toolbarPanes, filterLabel: 'Filter characters', width: 1200 } },
      { label: 'At 860, switcher as a pop-up', props: { title: 'BROKEN IN 4 PLACES', modes: workspaceModes, mode: 'cast', commands: toolbarCommands, panes: toolbarPanes, filterLabel: 'Filter characters', width: 860 } },
    ],
  },
  {
    // DataTable (data-layer plan K5; audit §2 item 2, §4.1). Virtualised, one persistent
    // selection, sortable headers, grouping with counts.
    id: 'data-table', name: 'DataTable', kind: 'component', section: 'components', group: 'lists', component: DataTable,
    examples: [
      { label: 'B4P lines', props: { rows: dialoguesData, columns: dialogueColumns, rowKey: (d) => d.element_id, label: 'Lines', selected: dialoguesData[3]?.element_id ?? '', viewportHeight: 480 } },
      { label: 'Grouped by scene', props: { rows: dialoguesData, columns: dialogueColumns, rowKey: (d) => d.element_id, label: 'Lines by scene', groupBy: (d) => d.scene_slugline, viewportHeight: 480 } },
      { label: 'Empty', props: { rows: [], columns: dialogueColumns, label: 'Objects', empty: 'No objects in this story.', viewportHeight: 120 } },
    ],
  },
  {
    // PropertyRow (data-layer plan K6; audit §3.12). One line, never wrapping; the full
    // value is the tooltip and the accessible description.
    id: 'property-row', name: 'PropertyRow', kind: 'component', section: 'components', group: 'inspectors', component: PropertyRow,
    examples: [
      { label: 'Scene slugline', props: { label: 'Scene', value: scenesData[0]?.slugline ?? '' } },
      { label: 'With source', props: { label: 'Voice', value: voicesData[0]?.name ?? '', source: 'cast' } },
    ],
  },
  {
    // InspectorSection (data-layer plan K6; audit §3.12). Collapsible, with a count.
    id: 'inspector-section', name: 'InspectorSection', kind: 'component', section: 'components', group: 'inspectors', component: InspectorSection,
    examples: [
      { label: 'Open with count', props: { title: 'Aliases', count: 3, children: buttonLabel('Des · Desi · Mr. D') } },
      { label: 'Collapsed', props: { title: 'Provenance', collapsed: true, children: buttonLabel('Parsed from the screenplay') } },
    ],
  },
  {
    // RenderMark (data-layer plan K7; audit §3.13). Absent when the engine says nothing.
    id: 'render-mark', name: 'RenderMark', kind: 'component', section: 'components', group: 'labels', component: RenderMark,
    examples: [
      { label: 'Ready', props: { state: 'ready' } },
      { label: 'Stale, host wording', props: { state: 'stale', label: 'Script changed since this read' } },
      { label: 'Missing', props: { state: 'missing' } },
      { label: 'Compact', props: { state: 'ready', compact: true } },
      { label: 'No state (renders nothing)', props: {} },
    ],
  },
  {
    // TokenField (data-layer plan K8; audit §1.5). A character's aliases. Adding asks the
    // host; the token appears when the host passes it back.
    id: 'token-field', name: 'TokenField', kind: 'component', section: 'components', group: 'fields', component: TokenField,
    examples: [
      { label: 'Aliases', props: { tokens: ['Des', 'Mr. D'], label: 'Aliases', placeholder: 'Add an alias' } },
      { label: 'Read-only', props: { tokens: ['Des', 'Mr. D'], label: 'Aliases', readonly: true } },
      { label: 'Empty', props: { tokens: [], label: 'Aliases', placeholder: 'Add an alias' } },
    ],
  },
  {
    // ScreenplayText (data-layer plan K9; audit §1.6). Selectable lines, copyable as written.
    id: 'screenplay-text', name: 'ScreenplayText', kind: 'component', section: 'components', group: 'media', component: ScreenplayText,
    examples: [
      { label: 'Opening scene', props: { elements: screenplayElements(compositionData.segments[0]), label: compositionData.segments[0].label, selected: compositionData.segments[0].events[1]?.elementId ?? '' } },
      { label: 'Empty', props: { elements: [], empty: 'This scene has no text.' } },
    ],
  },
  {
    // ScrubNumber (data-layer plan K10; audit §3.12). SpeechControls' bounds and steps,
    // the first consumer's (A8).
    id: 'scrub-number', name: 'ScrubNumber', kind: 'component', section: 'components', group: 'fields', component: ScrubNumber,
    examples: [
      { label: 'Temperature', props: { label: 'Temperature', value: 0.9, min: 0, max: 2, step: 0.05 } },
      { label: 'Top-K', props: { label: 'Top-K', value: 50, min: 1, max: 100, step: 1 } },
      { label: 'Disabled', props: { label: 'Top-P', value: 1, min: 0, max: 1, step: 0.05, disabled: true } },
    ],
  },
  {
    // CommandPalette (data-layer plan K11; audit §3.11). ⌘K. Disabled commands are listed
    // with their reasons.
    id: 'command-palette', name: 'CommandPalette', kind: 'component', section: 'components', group: 'shell', component: CommandPalette,
    examples: [
      { label: 'Every command', props: { commands: paletteCommands } },
      { label: 'Some commands unavailable', props: { commands: unavailableCommands } },
      { label: 'No commands', props: { commands: [] } },
    ],
  },
  {
    // StatusBar (data-layer plan K12; audit §1.15). Undo only when the host passes one.
    id: 'status-bar', name: 'StatusBar', kind: 'component', section: 'components', group: 'shell', component: StatusBar,
    examples: [
      { label: 'Analysis running, another queued', props: { engine: { state: 'ready', label: `khaosd ${engineData.daemonVersion ?? ''} ready`.trim() }, jobs: [{ id: 'scenes', label: 'Analysing scenes', progress: { completed: 12, total: 54 }, elapsedMs: 83_000, remainingMs: 290_000, cancel: () => {} }, { id: 'read', label: 'Reading S48' }] } },
      { label: 'Extraction starting, no count yet', props: { engine: { state: 'ready', label: 'khaosd ready' }, jobs: [{ id: 'extract', label: 'Extracting entities', elapsedMs: 4_000 }] } },
      { label: 'Result, no Undo', props: { engine: { state: 'ready', label: 'khaosd ready' }, result: { text: 'Cast DESMOND to Desmond' } } },
      { label: 'Offline', props: { engine: { state: 'offline', label: 'khaosd is not running' } } },
      // The story budget, one dollar limit. ILLUSTRATIVE (D62/D74) amounts in khaosd's shape (khaos-manager #1032).
      { label: 'Story budget: spent of the limit (illustrative)', props: { engine: { state: 'ready', label: 'khaosd ready' }, budget: { kind: 'loaded', usd: '10.00', spentUsd: '1.23', remainingUsd: '8.77' }, onchangebudget: () => {} } },
      { label: 'Story budget: nothing left (illustrative)', props: { engine: { state: 'ready', label: 'khaosd ready' }, budget: { kind: 'loaded', usd: '10.00', spentUsd: '10.00', remainingUsd: '0' }, onchangebudget: () => {} } },
      { label: 'Story budget: reading', props: { engine: { state: 'ready', label: 'khaosd ready' }, budget: { kind: 'reading' } } },
      { label: 'Story budget: none set', props: { engine: { state: 'ready', label: 'khaosd ready' }, budget: { kind: 'none' }, onchangebudget: () => {} } },
      { label: 'Story budget: unreadable (illustrative error)', props: { engine: { state: 'ready', label: 'khaosd ready' }, budget: { kind: 'failed', message: 'BUDGET_UNREADABLE: the budget file could not be parsed' }, onchangebudget: () => {} } },
    ],
  },
  {
    // Popover (data-layer plan K13); audit §3.7). Searchable, suggested item first, Esc
    // returns focus to the trigger; the panel floats over the flow.
    id: 'popover', name: 'Popover', kind: 'component', section: 'components', group: 'shell', component: Popover,
    examples: [
      { label: 'Voice picker', props: { label: 'Voice', value: 'Not cast', items: voiceItems, suggested: voiceItems[1]?.id ?? '' } },
      { label: 'Unavailable', props: { label: 'Voice', value: 'Not cast', items: voiceItems, disabledReason: 'The voice list could not be read' } },
    ],
  },
  {
    // Sheet (data-layer plan K14; audit §1.14, §3.15). Names its target; traps and
    // returns the focus. The text-input sheet is Clone's (khaotik-ui#46).
    id: 'sheet', name: 'Sheet', kind: 'component', section: 'components', group: 'shell', component: Sheet,
    examples: [
      { label: 'Delete a read', props: { title: 'Delete Read 2?', target: scenesData[47]?.slugline ?? scenesData[0]?.slugline ?? '', message: 'Its joined audio is removed from the project. The line takes it made stay with their lines.', confirmLabel: 'Delete', tone: 'danger' } },
      { label: 'Clone a repository', props: { title: 'Clone a KSPD repository', target: 'into ~/khaos/projects', confirmLabel: 'Clone', input: { label: 'Repository URL', placeholder: 'git@github.com:…' } } },
      { label: 'A second action', props: { title: 'The scenes need analysing first.', message: 'The places can’t be analysed yet: 1 scene changed since it was analysed and 1 has not been analysed.', secondaryLabel: 'View stale scenes', confirmLabel: 'Resolve…' } },
    ],
  },
  {
    // RenderStrip (data-layer plan K15; audit §3.6). One cell per scene; absent is not missing.
    id: 'render-strip', name: 'RenderStrip', kind: 'component', section: 'components', group: 'charts', component: RenderStrip,
    examples: [
      { label: 'No cells yet', props: { label: 'Scene reads', cells: [] } },
      { label: 'Every scene read', props: { label: 'Scene reads', cells: scenesData.map((s, i) => ({ id: s.id, label: `S${s.number ?? i + 1}`, state: 'ready' })) } },
      { label: 'B4P scenes', props: { label: 'Scene reads', selected: scenesData[2]?.id ?? '', cells: scenesData.map((s, i) => ({ id: s.id, label: `S${s.number ?? i + 1}`, state: i < 6 ? 'ready' : i === 6 ? 'stale' : i < 10 ? 'missing' : null })) } },
    ],
  },
  {
    // EventLog (data-layer plan K16; audit §1.10). The Activity table, virtualised.
    id: 'event-log', name: 'EventLog', kind: 'component', section: 'components', group: 'lists', component: EventLog,
    examples: [
      { label: 'A day of changes', props: { viewportHeight: 360, events: dialoguesData.slice(0, 120).map((d, i) => ({ id: String(120 - i), day: i < 80 ? 'Today' : 'Yesterday', time: `12:${String(i % 60).padStart(2, '0')}`, kind: i % 7 === 0 ? 'import' : 'adjudication', actor: i % 7 === 0 ? 'khaos-tools' : 'jev-1.13', change: `accept · character · ${d.character}` })) } },
      { label: 'Empty', props: { events: [], viewportHeight: 120, empty: 'No committed changes' } },
    ],
  },
  {
    // Checkbox (data-layer plan A6). One include/exclude mark per row: a Review group's
    // occurrences are decided together unless one is unchecked.
    id: 'checkbox', name: 'Checkbox', kind: 'component', section: 'components', group: 'shell', component: Checkbox,
    examples: [
      { label: 'Included', props: { label: 'Include line 12', checked: true } },
      { label: 'Excluded, label hidden', props: { label: 'Include line 40', checked: false, hideLabel: true } },
      { label: 'Disabled', props: { label: 'Include line 7', checked: true, disabled: true } },
    ],
  },
  {
    // RadioChoiceList (khaos-app design 2026-10-12, onboarding step 1). One choice among a
    // few, each caption part of what is chosen. Controlled: the host owns the value.
    id: 'radio-choice-list', name: 'RadioChoiceList', kind: 'component', section: 'components', group: 'shell', component: RadioChoiceList,
    examples: [
      { label: 'Suggested, with its reason', props: {
        label: 'How do you want to run AI?', value: 'hybrid', note: 'Suggested because Ollama is installed on this Mac.',
        options: [
          { value: 'cloud', title: 'In the cloud', caption: 'Use services like OpenAI, Anthropic or OpenRouter with your account. Nothing to install. Quickest to start.' },
          { value: 'local', title: 'On this Mac', caption: 'Run models on your own computer. Private and free to run. Needs downloads and setup, and works best on Apple Silicon.' },
          { value: 'hybrid', title: 'Both', caption: 'Use the cloud for some things and this Mac for others.' },
        ],
      } },
      { label: 'Disabled', props: {
        label: 'How do you want to run AI?', value: 'cloud', disabled: true,
        options: [
          { value: 'cloud', title: 'In the cloud', caption: 'Nothing to install.' },
          { value: 'local', title: 'On this Mac', caption: 'Run models on your own computer.' },
        ],
      } },
    ],
  },
  {
    // EngineDetails (data-layer plan A11; audit §3.9). The welcome window's engine plates, under
    // its rail: what is installed, what each routed capability is served by, and what runs on
    // this computer.
    id: 'engine-details', name: 'EngineDetails', kind: 'component', section: 'components', group: 'shell', component: EngineDetails,
    examples: [
      { label: 'Ready, routed, one engine running', props: {
        engine: { state: 'ready', components: engineComponents },
        routes: [{ capability: 'analysis.text', label: 'Analysis', provider: 'openrouter', model: 'deepseek/deepseek-v4.1-flash' }],
        services: [{ name: 'khaos-synth', state: 'running', ready_to_use: true }, { name: 'ollama', state: 'stopped' }, { name: 'localmlx', state: 'error', provisioned: false }],
      } },
      // The plate's update verdicts (#156): a label-only verdict that eats the row, and the same
      // verdict shortened to a word with `detail` carrying the full sentence.
      { label: 'Update verdicts', props: { engine: { state: 'ready', components: engineComponentsWithVerdicts } } },
      { label: 'Offline, nothing on this computer', props: { engine: {}, services: [] } },
    ],
  },
  {
    // The welcome window is WelcomeWindow's own Basic example; the banners' wording is the
    // app's, and their reasons are illustrative.
    id: 'launcher-window', name: 'LauncherWindow', kind: 'screen', section: 'screens', group: 'launcherWindow', component: LauncherWindow,
    examples: [
      { label: 'Ready', props: {}, snippets: { welcome: launcherWelcome } },
      { label: 'khaosd not reachable (illustrative reason)', props: { offline: { key: 'offline', headline: 'Khaos is not running.', body: 'Your stories are listed, and open once it is.', details: 'connection refused: 127.0.0.1:8765', loginItems: false }, onCheckAgain: () => {}, onReport: () => {} }, snippets: { welcome: launcherWelcome } },
      { label: 'Finish setting up (illustrative reason)', props: { setup: { key: 'setup', details: 'CUSTODY_MISSING: the credential store does not exist yet', failed: '', settling: false }, onRunSetup: () => {} }, snippets: { welcome: launcherWelcome } },
      { label: 'Choose how Khaos runs AI', props: { readiness: { kind: 'introduce' }, onGetStarted: () => {} }, snippets: { welcome: launcherWelcome } },
      { label: 'Something needs attention (illustrative)', props: { readiness: { kind: 'blocked', engine: `khaosd ${engineData.daemonVersion} is running.`, unmet: [{ id: 'python', name: 'Python', verdict: 'missing' }], blocked: [] }, onOpenSetup: () => {} }, snippets: { welcome: launcherWelcome } },
      { label: 'Checking at launch (illustrative states)', props: { checking: true, appVersion: '0.86.0', checks: startupChecks('pending') } },
      { label: 'Open from Git', props: { cloning: true }, snippets: { welcome: launcherWelcome } },
      { label: 'Empty', props: {} },
    ],
  },
  {
    // WelcomeWindow (data-layer plan A11; audit §3.9). The desktop welcome window: an action
    // rail with the engine plates always visible under it, and the stories as ProjectCards sized
    // to the pane (operator: "bring back the cards but adjust to fit").
    id: 'welcome-window', name: 'WelcomeWindow', kind: 'screen', section: 'screens', group: 'launcherWindow', component: WelcomeWindow,
    modes: ['path', 'history', 'gitSync'],
    examples: [
      { label: 'Basic', props: {
        ...welcomeReady, ...welcomeFor('basic'),
        projects: welcomeProjects,
        jobFor: welcomeJobFor,
        ...welcomeHandlers,
      } },
      { label: 'Advanced', props: { ...welcomeReady, ...welcomeFor('advanced'), projects: welcomeProjects, jobFor: welcomeJobFor, ...welcomeHandlers } },
      { label: 'Advanced · Project history', props: { ...welcomeReady, ...welcomeFor('advanced', { history: true }), projects: welcomeProjects, jobFor: welcomeJobFor, ...welcomeHandlers } },
      { label: 'Advanced · Git sync', props: { ...welcomeReady, ...welcomeFor('advanced', { history: true, gitSync: true }), projects: welcomeProjects, jobFor: welcomeJobFor, ...welcomeHandlers } },
      { label: 'Empty', props: { ...welcomeReady, ...welcomeFor('basic'), projects: [], ...welcomeHandlers } },
      { label: 'No stories, engine offline', props: { projects: [], engine: {} } },
    ],
  },
  {
    // The interpreter for a composed document (D8). It is what makes a published
    // `components/composed/*.json` renderable by a consuming app — JSON nobody
    // can interpret is not publishable in any useful sense.
    //
    // The examples pass the barrel, the other documents and the captured data as
    // PROPS, because all three are host questions: a document says
    // `{ $data: 'scenes' }`, meaning "the scenes collection", and the catalog
    // binds its captures where an app binds its own query. That is what keeps the
    // format portable rather than catalog-specific.
    id: 'composed', name: 'Composed', kind: 'component', section: 'components', group: 'composition', component: Composed,
    examples: composedExamples,
  },
  {
    // The engine's artifact registry. `catalogData` is a live capture of
    // GET /api/catalog/prompts — which returns EVERY kind, not just prompts.
    // The per-kind routes the issue named (#24) are 404; the sectioning here is
    // derived from the `kind` field.
    id: 'resource-catalog', name: 'ResourceCatalog', kind: 'screen', section: 'screens', group: 'resourcesWindow', component: ResourceCatalog,
    examples: [
      { label: 'Populated', props: { artifacts: catalogData.artifacts } },
      { label: 'With body', props: {
        artifacts: catalogData.artifacts,
        selectedId: catalogData.artifacts[0]?.id ?? '',
        body: '# Analyze character\n\nYou are a script analyst. Read the scenes below and\nreturn JSON matching character-schema.json.',
      } },
      // Kept even though the engine now serves every body: one that cannot be
      // fetched must read as listed-not-previewable, not as an error about the
      // artifact, whose registry entry is real and stays on screen.
      { label: 'Not previewable', props: {
        artifacts: catalogData.artifacts,
        selectedId: catalogData.artifacts.find((a) => a.kind === 'schema')?.id ?? '',
        bodyUnavailable: '404 from /api/catalog/prompts/…',
      } },
      { label: 'Empty', props: { artifacts: [] } },
    ],
  },
  {
    // The category rail and pane. Its content comes through the example's `snippets.children`,
    // which exists because this and LabeledField are both components whose job
    // is to wrap what the host supplies — spreading plain props rendered them as
    // empty frames.
    id: 'settings', name: 'Settings', kind: 'screen', section: 'screens', group: 'settingsWindow', component: Settings,
    modes: ['path', 'history', 'gitSync'],
    examples: [
      { label: 'Basic', props: { categories: settingsPanesFor('basic'), selected: 'providers' }, snippets: { children: [...pathRows('basic'), ...providerRows] } },
      { label: 'Advanced', props: { categories: settingsPanesFor('advanced'), selected: 'providers' }, snippets: { children: [...pathRows('advanced'), ...providerRows] } },
      { label: 'Advanced · Project history', props: { categories: settingsPanesFor('advanced'), selected: 'providers' }, snippets: { children: [...pathRows('advanced', { history: true }), ...providerRows] } },
      { label: 'Advanced · Git sync', props: { categories: settingsPanesFor('advanced'), selected: 'providers' }, snippets: { children: [...pathRows('advanced', { history: true, gitSync: true }), ...providerRows] } },
      { label: 'General', props: { categories: settingsPanesFor('basic'), selected: 'general' }, snippets: { children: generalRows } },
      { label: 'Empty', props: { categories: [], selected: '' } },
    ],
  },
  {
    // The path block, the engines and the engine's version are captured (setup.json,
    // services.json, engine.json); routing rows, the port and the pid are illustrative.
    id: 'settings-window', name: 'SettingsWindow', kind: 'screen', section: 'screens', group: 'settingsWindow', component: SettingsWindow,
    examples: [
      { label: 'Providers · Basic (captured path)', props: { panes: settingsPanesFor('basic'), pane: 'providers', path: settingsWindowPath(false), onChoosePath: () => {} } },
      { label: 'Providers · Advanced (captured path)', props: { panes: settingsPanesFor('advanced'), pane: 'providers', path: settingsWindowPath(true), onToggleFeature: () => {} } },
      { label: 'Routing (illustrative)', props: { panes: settingsPanesFor('advanced'), pane: 'routing', routing: settingsWindowRouting, onChooseRoute: () => {} } },
      { label: 'On-device Engines (captured)', props: { panes: settingsPanesFor('advanced'), pane: 'engines', engines: { kind: 'loaded', rows: servicesData }, onStartEngine: () => {}, onStopEngine: () => {}, onProvisionEngine: () => {} } },
      { label: 'Engine (captured version)', props: { panes: settingsPanesFor('basic'), pane: 'engine', engine: { version: engineData.daemonVersion, host: '127.0.0.1', port: 8765, pid: 4242, uptime: '2 h 14 min' } } },
      { label: 'General', props: { panes: settingsPanesFor('basic'), pane: 'general', appearances: [{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }], appearance: 'system', appVersion: '0.86.0', onAppearance: () => {} } },
      { label: 'Reading', props: { panes: settingsPanesFor('basic'), pane: 'providers', status: { kind: 'loading' } } },
      { label: 'Could not read (illustrative message)', props: { panes: settingsPanesFor('basic'), pane: 'providers', status: { kind: 'failed', message: 'khaosd is not running.' } } },
      { label: 'Empty', props: { panes: [], pane: '' } },
    ],
  },
  {
    // The detail is khaos-tools' own, from the captured staleness read; the headline and the fix
    // labels are the app's.
    id: 'stale-sheet', name: 'StaleSheet', kind: 'component', section: 'screens', group: 'dataLayer', component: StaleSheet,
    emptyNotApplicable: 'The sheet exists only to show a refused analysis; there is no empty refusal.',
    examples: [
      { label: 'View and Resolve (captured detail)', props: { headline: 'Some scenes need analysis first', detail: staleCharacter?.details?.[0] ?? '', projectTitle: 'BROKEN IN 4 PLACES', viewLabel: 'View stale scenes', resolveLabel: 'Resolve…', onView: () => {}, onResolve: () => {}, onCancel: () => {} } },
      { label: 'View only, Resolve could not clear it', props: { headline: 'Some scenes need analysis first', detail: staleCharacter?.details?.[0] ?? '', projectTitle: 'BROKEN IN 4 PLACES', viewLabel: 'View stale scenes', onView: () => {}, onCancel: () => {} } },
    ],
  },
  {
    id: 'project-status-hud', name: 'ProjectStatusHUD', kind: 'component', section: 'screens', group: 'dataLayer', component: ProjectStatusHUD,
    examples: [
      { label: 'A job running', props: { active: true, jobs: [{ id: 'scenes', label: 'Analysing scenes', progress: { completed: 12, total: 57 } }] } },
      { label: 'A result', props: { active: true, result: { text: 'Cast DESMOND to Desmond' } } },
      { label: 'Empty', props: { active: true } },
    ],
  },
  {
    // The data-layer window: one example per destination, each pane its own captured fixture.
    id: 'shell', name: 'Shell', kind: 'screen', section: 'screens', group: 'dataLayer', component: Shell,
    examples: [
      shellDestination('characters', 'Characters'),
      shellDestination('scenes', 'Scenes'),
      shellDestination('places', 'Places'),
      shellDestination('objects', 'Objects'),
      shellDestination('images', 'Images'),
      shellDestination('audio', 'Audio'),
      { ...shellDestination('scenes', 'Scenes'), label: 'A job running', props: { ...shellWindow('scenes', 'Scenes'), jobs: [{ id: 'scenes', label: 'Analysing scenes', progress: { completed: 12, total: 57 } }] } },
      { ...shellDestination('characters', 'Characters'), label: 'Story update failed (illustrative message)', props: { ...shellWindow('characters', 'Characters'), snapshotError: 'khaosd is not running.', onRetrySnapshot: () => {} } },
      { ...shellDestination('characters', 'Characters'), label: 'Story update failed, with Project Settings (illustrative message)', props: { ...shellWindow('characters', 'Characters'), snapshotError: 'khaosd is not running.', onRetrySnapshot: () => {}, onProjectSettings: () => {} } },
      {
        label: 'Overview (captured verdict, illustrative spend)',
        props: { ...shellWindow('characters', 'Characters'), modes: [{ value: 'overview', label: 'Overview' }, ...shellWindow('characters', 'Characters').modes], presentation: 'overview', budget: overviewStrip.budget, onProjectSettings: () => {} },
        snippets: { overview: [{ component: StoryOverviewStrip, props: overviewStrip }] },
      },
      { label: 'Empty', props: { title: 'Untitled', layout: dockStory, panels: dockPanels, sections: [], workspace: 'story', destination: 'characters' } },
    ],
  },
  {
    // A refused action's fixes beside khaosd's words. Fix labels are the app's
    // (khaos-app src/app/refusal-offer.ts:16-22); the headline is khaosd's outcome title,
    // which has no capture, so it is illustrative (D62). The detail is a captured reason.
    id: 'refusal-offer', name: 'RefusalOffer', kind: 'component', section: 'screens', group: 'dataLayer', component: RefusalOffer,
    examples: [
      { label: 'Stale scenes (illustrative headline)', props: { offer: { headline: 'Some scenes need analysis first', detail: staleCharacter?.details?.[0] ?? '', fixes: [{ kind: 'view-scenes', label: 'View stale scenes' }, { kind: 'resolve', label: 'Resolve…' }] } } },
      { label: 'Empty', props: { offer: { headline: 'The engine refused this', fixes: [] } } },
    ],
  },
  {
    id: 'provider-disclosure', name: 'ProviderDisclosure', kind: 'component', section: 'screens', group: 'setupWindow', component: ProviderDisclosure,
    examples: [
      // khaosd's own disclosure, captured in setup.json.
      { label: setupData.disclosures[0]?.title ?? 'Disclosure', props: { disclosure: setupData.disclosures[0] ?? null } },
      { label: 'Empty', props: { disclosure: null } },
    ],
  },
  {
    // The launcher's and Setup's one confirmation; its wording follows the setup path.
    id: 'finish-setup-confirm', name: 'FinishSetupConfirm', kind: 'component', section: 'screens', group: 'launcherWindow', component: FinishSetupConfirm,
    modes: ['path'],
    examples: [
      { label: 'Basic', props: { open: true, basic: true } },
      { label: 'Advanced', props: { open: true, basic: false } },
      { label: 'Empty', props: { open: false } },
    ],
  },
  {
    // Sentences are QuitModel.sentence's (khaos-app src/app/quit.svelte.ts:58-63).
    id: 'quit-prompt', name: 'QuitPrompt', kind: 'component', section: 'screens', group: 'launcherWindow', component: QuitPrompt,
    examples: [
      { label: 'An analysis is running', props: { open: true, sentence: "An analysis is still running. If you let it finish, it keeps using your AI account until it's done." } },
      { label: 'Analysis and sign-in', props: { open: true, sentence: "An analysis is still running, and a sign-in is still waiting in your browser. If you let the analysis finish, it keeps using your AI account until it's done." } },
      { label: 'Quitting', props: { open: true, busy: true, sentence: 'A sign-in is still waiting in your browser.' } },
      { label: 'Empty', props: { open: false } },
    ],
  },
  {
    id: 'generation-failure-details', name: 'GenerationFailureDetails', kind: 'component', section: 'screens', group: 'scenes', component: GenerationFailureDetails,
    examples: [
      { label: 'Provider refused (illustrative)', props: { generation: illustrativeFailure, copy: () => Promise.resolve() } },
      { label: 'Empty', props: { generation: { id: 'gen_ok' } } },
    ],
  },
  {
    id: 'analysis-stale', name: 'AnalysisStale', kind: 'component', section: 'screens', group: 'characters', component: AnalysisStale,
    examples: [
      { label: staleCharacter ? `${staleCharacter.name} (captured)` : 'Stale', props: { standing: staleCharacter } },
      { label: 'Empty', props: { standing: { state: 'current', reasons: [], details: [] } } },
    ],
  },
  {
    id: 'image-thumb', name: 'ImageThumb', kind: 'component', section: 'screens', group: 'images', component: ImageThumb,
    examples: [
      { label: 'Reference (illustrative)', props: { src: madisonFigure, name: 'Madison', kind: 'character', width: 3, height: 4 } },
      { label: 'Table row', props: { src: madisonFigure, name: 'Madison', kind: 'character', square: true } },
      { label: 'Empty', props: { src: '', name: 'Madison', kind: 'character', width: 3, height: 4 } },
    ],
  },
  {
    id: 'subject-images', name: 'SubjectImages', kind: 'component', section: 'screens', group: 'characters', component: SubjectImages,
    examples: [
      { label: 'Images (illustrative)', props: { read: { kind: 'loaded', rows: [{ referenceId: 'ref-front', label: 'Front' }, { referenceId: 'ref-side', label: 'Side' }] }, urls: { 'ref-front': madisonFigure }, kind: 'character' } },
      { label: 'Reading', props: { read: { kind: 'loading' } } },
      { label: 'Read failed', props: { read: { kind: 'failed', message: 'subject not found' } } },
      { label: 'Empty', props: { read: { kind: 'loaded', rows: [] }, kind: 'character' } },
    ],
  },
  {
    id: 'playback-event-inspector', name: 'PlaybackEventInspector', kind: 'component', section: 'screens', group: 'storyPlayer', component: PlaybackEventInspector,
    examples: [
      { label: 'A captured line', props: {
        scene: evictionPlayback({ takeId: 'read-1' }),
        event: evictionLine ? { elementType: evictionLine.elementType, characterName: evictionLine.characterName, text: evictionLine.text, start: (evictionLine.startMs ?? 0) / 1000, duration: evictionLine.durationMs ? evictionLine.durationMs / 1000 : null } : null,
        character: evictionSpeaker ? { id: evictionSpeaker.id, name: evictionSpeaker.name } : undefined,
        portrait: madisonFigure,
      } },
      { label: 'Empty', props: { scene: evictionPlayback(null), event: null } },
    ],
  },
  {
    // The captured scene read on its own timeline: scene-read.json's lines and peaks.
    id: 'read-timeline', name: 'ReadTimeline', kind: 'component', section: 'screens', group: 'scenes', component: ReadTimeline,
    examples: [
      { label: 'A captured read', props: { state: { kind: 'loaded' }, segments: [sceneReadSegment], peaks: sceneReadData.readPeaks ?? null, currentTime: 0, selectedElementId: readLines[0]?.eventId ?? '' } },
      { label: 'Peaks failed', props: { state: { kind: 'loaded' }, segments: [sceneReadSegment], peaks: null, peaksError: 'peaks unavailable: the audio file could not be decoded' } },
      { label: 'Opening', props: { state: { kind: 'loading' } } },
      { label: 'Empty', props: { state: { kind: 'failed', message: 'scene take not found' } } },
    ],
  },
  {
    // A captured place that is only named in three scenes (locations.json).
    id: 'identity-side', name: 'IdentitySide', kind: 'component', section: 'screens', group: 'places', component: IdentitySide,
    examples: [
      { label: namedPlace ? `${namedPlace.name} (captured)` : 'Place', props: {
        kind: 'location', item: namedPlace,
        named: (namedPlace?.mentionedSceneIds ?? []).map((id) => ({ id, label: scenesData.find((sc) => sc.id === id)?.slugline || id })),
        deletable: false,
      } },
      { label: 'Deletable', props: { kind: 'location', item: namedPlace, named: [], deletable: true, deleteMessage: 'It is removed from the story. The scenes that named it keep their text.' } },
      { label: 'Empty', props: { kind: 'location', item: null } },
    ],
  },
  {
    // Madison's first captured line (dialogues.json). Takes are the illustrative set (D62);
    // billing and the refusal are the states the app's preview reports.
    id: 'dialogue-inspector', name: 'DialogueInspector', kind: 'component', section: 'screens', group: 'characters', component: DialogueInspector,
    examples: [
      { label: 'Takes', props: { line: madisonLine, speaker: 'Madison', position: { n: 1, of: 3 }, takesOffered: true, takes: illustrativeTakes } },
      { label: 'Billed voice', props: { line: madisonLine, speaker: 'Madison', position: null, takesOffered: true, takes: [], billedBy: 'Gemini TTS' } },
      { label: 'Voice not locked', props: { line: madisonLine, speaker: 'Madison', position: null, takesOffered: true, takes: [], refusal: 'Madison is cast to a voice that is not locked.', lockVoices: [{ voiceProfileId: 'vp-madison', voiceName: 'Madison' }], onLockVoice: () => {} } },
      { label: 'Empty', props: { line: madisonLine, speaker: 'Madison', position: null, takesOffered: false } },
    ],
  },
  {
    // An action line's event view, and a line the composition does not hold.
    id: 'line-inspector', name: 'LineInspector', kind: 'component', section: 'screens', group: 'scenes', component: LineInspector,
    examples: [
      { label: 'An action line', props: { event: evictionAction ? { elementType: 'action', text: evictionAction.text } : null, backLabel: 'Back to the scene' } },
      { label: 'A dialogue line', props: { event: evictionLine ? { elementType: 'dialogue', text: evictionLine.text, characterName: evictionLine.characterName, characterId: evictionLine.characterId } : null, backLabel: 'Back to the scene' },
        snippets: { dialogue: [{ component: DialogueInspector, props: { line: madisonLine, speaker: 'Madison', takesOffered: true, takes: illustrativeTakes } }] } },
      { label: 'Empty', props: { event: null, backLabel: 'Back to the scene' } },
    ],
  },
  {
    // The captured read is the one take (scene-read.json); the narrator and refusal states
    // are the ones the app's casting reports.
    id: 'scene-reads', name: 'SceneReads', kind: 'component', section: 'screens', group: 'scenes', component: SceneReads,
    examples: [
      { label: 'A chosen read', props: { sceneHeading: sceneReadData.sceneHeading, takes: sceneReadTakes, chosenId: sceneReadTakes[0]?.id ?? '', canDownload: true, narrator: { status: 'usable' }, skipped: [] } },
      { label: 'Narrator not locked', props: { sceneHeading: sceneReadData.sceneHeading, takes: sceneReadTakes, chosenId: '', narrator: { status: 'notLocked', name: 'Narrator', voiceProfileId: 'vp-narrator' }, onLockVoice: () => {}, unchosenIds: sceneReadTakes.map((t) => t.id) } },
      { label: 'No narrator', props: { sceneHeading: sceneReadData.sceneHeading, takes: [], narrator: { status: 'unset' }, canChooseNarrator: true } },
      { label: 'Hosted playback', props: { sceneHeading: sceneReadData.sceneHeading, playback: 'hosted', takes: sceneReadTakes, chosenId: sceneReadTakes[0]?.id ?? '', onOpen: () => {} } },
      { label: 'Empty', props: { sceneHeading: sceneReadData.sceneHeading, takes: [], narrator: { status: 'usable' } } },
    ],
  },
  ...characterPanes,
  ...scenePanes,
  ...placePanes,
  ...mediaPanes,
  ...reviewPanes,
  ...windowPanes,
]

// ---- navigation structure ----------------------------------------------------
// Lives in ./taxonomy.js, which the taxonomy gate imports directly.
export { SECTION_ORDER, SECTION_LABELS, APP_GROUP_LABELS, APP_GROUPS_IN_APP, SECTION_GROUPS, SECTION_EMPTY, GROUP_LABELS, GROUP_ORDER, CREATABLE_IN, GROUP_EMPTY } from './taxonomy.js'

// ── flows ──────────────────────────────────────────────────────────────────
//
// A flow is an ORDERED REFERENCE to screens that already exist, not a copy of
// them and not a new place for them to live. A screen is filed once, under
// `screens`; a flow names its ids in the order you walk them:
//
//   { id: 'first-run', name: 'First run', section: 'flows', group: 'flows',
//     kind: 'flow', steps: ['launcher-window', 'shell'] }
//
// `steps` holds ids rather than components so a flow cannot drift from the
// screen it claims to show — change the screen and every flow through it
// follows. It is the same reason `parse.js` reads `tokens.css` back instead of
// restating it.
//
// A flow carries no per-step caption. Mobbin's flows carry a position and
// nothing else, and the one thing a caption per frame reliably does is go stale
// against the screen beside it.
//
// `components/composed/first-run.json` publishes `splash → launcher-window → shell`,
// cited from khaos-app's own source at 684accd: the splash runs the system checks
// before any other window (`src/main.ts:279`), the launcher is the front door
// (`src/main.ts:873`), and every story opens in the data-layer window
// (`src/domain/surface.ts:176`). Setup opens only when asked (`src/main.ts:308`), so
// it is not a step. A sequence comes from the app's source, never from prop names.
// A flow lives in components/composed/ because a `kind: 'flow'` entry HERE reaches
// no renderer in either mode.

/**
 * Resolve a flow's steps to the screen fixtures they name.
 *
 * Returns `{ steps, missing }` rather than throwing: the catalog's job is to
 * report a gap, and a flow naming a screen that has been renamed should fail a
 * gate with the id in hand, not blank a strip at runtime.
 *
 * @param {{ steps?: string[] }} flow
 * @param {Array<{ id: string, section: string }>} registry
 */
/**
 * What a flow step may name: a screen.
 *
 * ONE TEST, because there is now one kind of screen. A composed screen files in
 * the Screens section beside the hand-authored ones — whether it was typed in
 * Svelte or composed in JSON is provenance, not category, exactly as the Svelte
 * badge treats it. The `|| kind === 'page'` this used to carry existed only
 * because composed screens were filed somewhere else, which was a consequence of
 * Compose being its own destination rather than a considered call.
 *
 * It stays a SECTION test rather than becoming `kind === 'screen'`, which reads
 * better and is wrong: the six BrandKit specimens carry `kind: 'screen'` with
 * `section: 'brandkit'`, and a flow stepping through the colour palette is not a
 * journey.
 */
export const isFlowStep = (f) => f.section === 'screens'

export const resolveFlowSteps = (flow, registry = fixtures) => {
  const screens = new Map(registry.filter(isFlowStep).map((f) => [f.id, f]))
  const steps = []
  const missing = []
  for (const id of flow?.steps ?? []) {
    const screen = screens.get(id)
    if (screen) steps.push(screen)
    else missing.push(id)
  }
  return { steps, missing }
}
