# Cyber Detective v3: asset credits and licences

All imported 3D models are CC0 (public domain): free for commercial use, no attribution required. Authors are credited anyway.

| File | Original asset | Author | Source (original page) | Licence | Used in |
|---|---|---|---|---|---|
| models/sofa_wood_leather.glb | Sheen Wood Leather Sofa | Wayfair / Khronos sample | github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/SheenWoodLeatherSofa | CC0 1.0 | Living room sofa |
| models/vase_flowers.glb | Glass Vase Flowers (ceramic vase only) | Khronos sample assets | github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/GlassVaseFlowers | CC0 1.0 | Hallway console |
| models/armchair-lounge.glb | Modern Arm Chair 01 | Vibrant Nordic (Poly Haven) | polyhaven.com/a/modern_arm_chair_01 | CC0 1.0 | Living room |
| models/ottoman.glb | Ottoman 01 | Caspian Fortune (Poly Haven) | polyhaven.com/a/ottoman_01 | CC0 1.0 | Living room |
| models/sideboard.glb | Modern Wooden Cabinet | Patrik Pangerl (Poly Haven) | polyhaven.com/a/modern_wooden_cabinet | CC0 1.0 | TV cabinet (tinted walnut) |
| models/dining-chair-leather.glb | Dining Chair 02 | James Ray Cock (Poly Haven) | polyhaven.com/a/dining_chair_02 | CC0 1.0 | Kitchen x4, bedroom vanity, back bedroom |
| models/side-table.glb | Side Table 01 | James Ray Cock (Poly Haven) | polyhaven.com/a/side_table_01 | CC0 1.0 | Nightstands, hallway console |
| models/chest-tall.glb | Drawer Cabinet | Ulan Cabanilla (Poly Haven) | polyhaven.com/a/drawer_cabinet | CC0 1.0 | Computer room |
| models/shelving-wide.glb | Steel Frame Shelves 03 | Ulan Cabanilla (Poly Haven) | polyhaven.com/a/steel_frame_shelves_03 | CC0 1.0 | Storage room |
| models/plant-large.glb | Potted Plant 01 | Rico Cilliers (Poly Haven) | polyhaven.com/a/potted_plant_01 | CC0 1.0 | Living room, upstairs landing |
| models/plant-small.glb | Potted Plant 02 | Rico Cilliers (Poly Haven) | polyhaven.com/a/potted_plant_02 | CC0 1.0 | Computer room |

The Poly Haven models were obtained as web-optimised GLBs (meshopt + WebP, 512 px) from github.com/MostasimLeons/threejs-room-designer, whose README lists each Poly Haven source and the CC0 licence. Khronos models were downloaded from the glTF-Sample-Assets repo and their textures were downsized to 256–512 px (tools/glb-shrink.js).

Libraries: three.js r128 (MIT), GLTFLoader r128 (MIT), meshoptimizer decoder (MIT, Arseny Kapoulkine). All other furniture, textures, audio and UI are procedural and original to this project.

## v4 additions
- Fonts: Chakra Petch and Sarabun (Google Fonts, SIL Open Font License 1.1), loaded from fonts.googleapis.com; offline builds fall back to the system Thai fonts (Leelawadee UI / Tahoma on Windows, Loma on Linux).
- Audio: every sound (ambience, footsteps, stairs, microwave, fridge, sparks, siren, police, breathing, intruder steps) is synthesized at runtime with the Web Audio API. No audio files, no third-party sound assets.
- Intruder character, suburb (neighbour houses, cars, fences, street lights, power pole), louvered wardrobe, fridge/microwave/pizza, wire panel, CRT menu, case-file evidence images: original procedural content made for this project.
- Microphone: processed locally via an AnalyserNode only while hidden in the wardrobe; never recorded, stored or transmitted; stopped when leaving the wardrobe.

## Photo textures (V6 environment pass)

All from Poly Haven, CC0 1.0 (public domain). Diffuse maps downloaded at 1K via api.polyhaven.com and downscaled to 512 px.

| File | Poly Haven asset | Used for |
|---|---|---|
| tex/asphalt.jpg | asphalt_02 (polyhaven.com/a/asphalt_02) | Street |
| tex/bark.jpg | bark_brown_02 (polyhaven.com/a/bark_brown_02) | Tree trunks and limbs |
| tex/brick.jpg | brick_4 (polyhaven.com/a/brick_4) | Chimneys |
| tex/concrete.jpg | brushed_concrete (polyhaven.com/a/brushed_concrete) | Sidewalks, stoops, concrete |
| tex/lawn.jpg | grass_ground (polyhaven.com/a/grass_ground) | Lawns |
| tex/planks.jpg | brown_planks_05 (polyhaven.com/a/brown_planks_05) | Neighbour house siding (tinted) |
| tex/roof.jpg | grey_roof_01 (polyhaven.com/a/grey_roof_01) | Roof shingles |
| tex/siding.jpg | weathered_plank_siding (polyhaven.com/a/weathered_plank_siding) | Privacy fence boards (rotated) |

## Characters

| File | Asset | Author | Licence | Used for |
|---|---|---|---|---|
| models/kenney/character.js (characterMedium.fbx, base64), models/kenney/humanMaleA.png | Animated Characters Retro 1.1 (supplied by the user) | Kenney (www.kenney.nl) | CC0 1.0 (models/kenney/License.txt) | Player body (cutscenes, photos, CCTV) and the intruder (skin darkened) |

lib/FBXLoader.js, lib/fflate.min.js, lib/NURBSCurve.js, lib/NURBSUtils.js: three.js r128 examples (MIT).

## Models added in V7 (Poly Haven, CC0 1.0)

Downloaded as glTF 1K from api.polyhaven.com (the same assets the user supplied as .blend), textures downscaled to 128–512 px and packed into single GLBs (models/*.js, base64).

| File | Poly Haven asset | Used for |
|---|---|---|
| models/covered-car.js | covered_car | Richard's car under a dust cover in the driveway |
| models/notepads.js | office_notepads | Richard's note stuck on the fridge door |
| models/chandelier.js | Chandelier_01 | Over the dining table |
| models/food-cans.js | long_life_food | Storeroom shelves |
| models/wine-bottles.js | wine_bottles_01 | Kitchen counter |

pine_sapling_small (398k triangles) and tree_small_02 (4.6M triangles) were not used: too heavy for the browser game.
