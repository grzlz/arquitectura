# Blender scene for the OG image: one printed sheet on a pale table, the editor's
# red pencil across its corner, soft window light, shot straight down.
# Run by render.mjs:  blender -b --factory-startup -P scene.py -- <texture> <out.png> [samples] [percent]
import math
import sys

import bpy
from mathutils import Matrix, Vector

texture_path, out_path, *rest = sys.argv[sys.argv.index("--") + 1 :]
samples = int(rest[0]) if rest else 256
percent = int(rest[1]) if len(rest) > 1 else 100  # draft renders: 25

SHEET_W, SHEET_H = 0.30, 0.30 / 1.58  # metres; matches sheet.html's 1580×1000
FRAME_W = 0.47  # orthographic frame width; 2400×1260 → 0.247 tall


def linear(hex_color):
    """sRGB hex → linear RGBA, which Principled BSDF expects."""
    out = []
    for i in (0, 2, 4):
        c = int(hex_color[i : i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, 1.0)


def material(name, color, roughness, coat=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = linear(color)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Coat Weight"].default_value = coat
    return mat


def active(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# --- render -------------------------------------------------------------
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = samples
scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = 2400, 1260
scene.render.resolution_percentage = percent
scene.render.image_settings.file_format = "JPEG"  # link previews (WhatsApp, Telegram) drop heavy images
scene.render.image_settings.color_mode = "RGB"
scene.render.image_settings.quality = 88
scene.render.filepath = out_path
scene.view_settings.view_transform = "Standard"  # paper stays paper-white, no AgX grey
scene.view_settings.look = "None"
scene.view_settings.exposure = 0.0

world = bpy.data.worlds.new("Room")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.32
scene.world = world

# --- table --------------------------------------------------------------
bpy.ops.mesh.primitive_plane_add(size=3)
bpy.context.object.data.materials.append(material("Table", "e6e4df", 0.85))

# --- sheet: thin slab for the edge, textured face on top ------------------
sheet_at = Vector((-0.032, 0.002, 0))
sheet_turn = math.radians(-1.1)

bpy.ops.mesh.primitive_cube_add(size=1)
slab = bpy.context.object
slab.scale = (SHEET_W, SHEET_H, 0.0006)
slab.location = sheet_at + Vector((0, 0, 0.0003))
slab.rotation_euler.z = sheet_turn
slab.data.materials.append(material("PaperEdge", "f4f2ec", 0.7))

bpy.ops.mesh.primitive_plane_add(size=1)
face = bpy.context.object
face.scale = (SHEET_W, SHEET_H, 1)
face.location = sheet_at + Vector((0, 0, 0.00061))
face.rotation_euler.z = sheet_turn
paper = material("Paper", "fbfaf7", 0.62)
nodes, links = paper.node_tree.nodes, paper.node_tree.links
nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.12  # matte stock; sheen greys the ink
tex = nodes.new("ShaderNodeTexImage")
tex.image = bpy.data.images.load(texture_path)
tex.interpolation = "Cubic"
links.new(tex.outputs["Color"], nodes["Principled BSDF"].inputs["Base Color"])
face.data.materials.append(paper)

# --- the editor's red pencil, built along +Z, tail at the origin ----------
R = 0.004  # hex circumradius (≈7 mm across flats)
APOTHEM = R * math.cos(math.radians(30))
BODY, WOOD, LEAD = 0.155, 0.022, 0.0045

bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=R, depth=BODY, location=(0, 0, BODY / 2))
body = bpy.context.object
body.data.materials.append(material("Lacquer", "b3261e", 0.3, coat=0.6))
bevel = body.modifiers.new("Bevel", "BEVEL")
bevel.width, bevel.segments = 0.00035, 3
active(body)
bpy.ops.object.modifier_apply(modifier="Bevel")
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))

bpy.ops.mesh.primitive_cone_add(
    vertices=48, radius1=APOTHEM, radius2=0.00105, depth=WOOD, location=(0, 0, BODY + WOOD / 2)
)
wood = bpy.context.object
wood.data.materials.append(material("Cedar", "d9b48a", 0.75))
bpy.ops.object.shade_smooth()

bpy.ops.mesh.primitive_cone_add(
    vertices=48, radius1=0.00105, radius2=0.00008, depth=LEAD, location=(0, 0, BODY + WOOD + LEAD / 2)
)
lead = bpy.context.object
lead.data.materials.append(material("RedLead", "8c1c16", 0.45))
bpy.ops.object.shade_smooth()

bpy.ops.object.select_all(action="DESELECT")
for part in (body, wood, lead):
    part.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
pencil = body
bpy.ops.object.transform_apply(location=True)  # origin back to the tail, not the body's centre

# Spin about its axis so a flat face (the side normal nearest local +X) rests on the table.
sides = [p.normal for p in pencil.data.polygons if abs(p.normal.z) < 0.01]
spin = -min((math.atan2(n.y, n.x) for n in sides), key=abs)

tip = Vector((0.074, -0.034))
heading = math.atan2(0.075, -0.16)  # tail at lower right, tip reaching up-left onto the sheet
length = BODY + WOOD + LEAD
tail = tip - length * Vector((math.cos(heading), math.sin(heading)))
pencil.matrix_world = (
    Matrix.Translation((tail.x, tail.y, APOTHEM + 0.0006))
    @ Matrix.Rotation(heading, 4, "Z")
    @ Matrix.Rotation(math.radians(90), 4, "Y")
    @ Matrix.Rotation(spin, 4, "Z")
)

# --- light: a big soft window, upper left -----------------------------------
bpy.ops.object.light_add(type="AREA", location=(-0.55, 0.45, 0.9))
window = bpy.context.object
window.data.shape = "RECTANGLE"
window.data.size, window.data.size_y = 1.1, 0.6
window.data.energy = 18
window.rotation_euler = (Vector((0, 0, 0)) - window.location).to_track_quat("-Z", "Y").to_euler()

# --- camera: straight down, orthographic, so the type stays sharp ----------
bpy.ops.object.camera_add(location=(0, 0, 1))
camera = bpy.context.object
camera.data.type = "ORTHO"
camera.data.ortho_scale = FRAME_W
camera.data.clip_start = 0.01
scene.camera = camera

bpy.ops.render.render(write_still=True)
