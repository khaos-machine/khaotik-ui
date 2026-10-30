# Place Build rounds

The line art behind the `PlaceBuildRounds` catalog examples. It was captured on
2026-10-26 from khaosd 0.188.0, using
`GET /api/v1/places/definitions/{id}/guides/{camera}/lineart.png`, for
Desmond's apartment in the BROKEN IN 4 PLACES proof package. That build ran
from 15:04:54 to 15:05:24 and wrote four drafts:

| Round | Definition |
| --- | --- |
| 1 | `place_definition_01M5WBWDSHRQ1Q8X0FKJWYP7SB` |
| 2 | `place_definition_01M5WBWJD9DWB59JQSH8SKYXDA` |
| 3 | `place_definition_01M5WBWZXDX7VF3KQQE82DSWC5` |
| 4 | `place_definition_01M5WBXB9K8519X2Y51HFMQJ9W` |

Round 1 has no files. khaosd answers every view of it with
`PLACE_DEFINITION_FAILED`, because a bed fixture's dimensions are out of
range, so the examples show that round with no picture.

The PNGs are 1536×1024. They were resized to 480 px wide and converted with
`cwebp -q 70`.

The placement problems in the "with problems" example are illustrative.
khaosd reports placement only on a live job's rounds, and the build above ran
before khaosd started reporting it.
