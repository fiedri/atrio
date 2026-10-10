#!/usr/bin/env python3
"""Genera páginas de menú placeholder para desarrollo.

Las imágenes simulan una carta real (encabezado, secciones, ítems con precio)
para poder juzgar el layout con contenido y no con rectángulos grises.

    python3 scripts/generate-mock-pages.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 720, 1000
BG = "#141414"
TEXT = "#f2f2f2"
MUTED = "#8a8a8a"
ACCENT = "#d4a056"
BORDER = "#2b2b2b"

REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

MENU_CARTA = [
    ("ENTRADAS", [
        ("Empanadas de carne (x3)", "4.200"),
        ("Empanadas de pollo y queso (x3)", "4.200"),
        ("Empanadas de humita (x3)", "4.600"),
        ("Provoleta a la parrilla", "7.800"),
        ("Queso fyn con membrillo", "6.500"),
    ]),
    ("PRINCIPALES", [
        ("Bife de chorizo, provoleta y criolla", "18.900"),
        ("Milanesa napolitana con papas", "15.400"),
        ("Suprema de pollo al horno", "14.200"),
        ("Pasta a la boloñesa", "13.800"),
        ("Pescado al horno con verduras", "19.500"),
    ]),
    ("POSTRES", [
        ("Flan casero con dulce de leche", "4.800"),
        ("Vigilante de chocolate", "5.200"),
        ("Helado de chocolate", "4.300"),
    ]),
]

MENU_PRINCIPALES = [
    ("DEL DIA", [
        ("Tapas de la casa", "9.800"),
        ("Ensalada de verdes y salmón", "16.500"),
        ("Croquetas de jamón y queso", "7.200"),
    ]),
    ("PARA COMPARTIR", [
        ("Tabla de quesos y embutidos", "22.000"),
        ("Papas a la provoleta", "11.300"),
        ("Empanadas de la casa (x6)", "8.400"),
    ]),
]

MENU_BEBIDAS = [
    ("SIN ALCOHOL", [
        ("Limonada con menta", "4.500"),
        ("Jugo de naranja natural", "5.200"),
        ("Agua mineral 500ml", "3.000"),
    ]),
    ("CERVEZAS", [
        ("Cerveza rubia chica", "3.800"),
        ("Cerveza rubia grande", "5.000"),
        ("Cerveza artesanal IPA 473cc", "7.500"),
    ]),
    ("VINOS", [
        ("Tinto Malbec, botella", "16.000"),
        ("Tinto Syrah, botella", "14.500"),
        ("Blanco Tramontana, botella", "13.000"),
    ]),
]


def font(path, size):
    return ImageFont.truetype(path, size)


def draw_page(sections, title, subtitle, idx, total):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    d.text((60, 54), title, font=font(SERIF, 42), fill=ACCENT)
    d.text((60, 110), subtitle, font=font(REG, 18), fill=MUTED)
    d.line([(60, 150), (W - 60, 150)], fill=BORDER, width=1)

    counter = f"{idx}/{total}"
    d.text((W - 60 - d.textlength(counter, font=font(REG, 16)), 110), counter,
           font=font(REG, 16), fill=MUTED)

    y = 194
    for section, items in sections:
        d.text((60, y), section, font=font(BOLD, 21), fill=TEXT)
        y += 42
        for name, price in items:
            d.text((60, y), name, font=font(REG, 18), fill=TEXT)
            price_w = d.textlength(price, font=font(BOLD, 18))
            name_w = d.textlength(name, font=font(REG, 18))
            start = 60 + name_w + 16
            end = W - 60 - price_w - 14
            x = start
            while x < end:
                d.ellipse([x, y + 12, x + 2, y + 14], fill=BORDER)
                x += 9
            d.text((W - 60 - price_w, y), price, font=font(BOLD, 18), fill=ACCENT)
            y += 34
        y += 24

    d.line([(60, H - 76), (W - 60, H - 76)], fill=BORDER, width=1)
    d.text((60, H - 58), "@lodopepe.ar", font=font(REG, 15), fill=MUTED)
    tag = "Imagen de prueba"
    d.text((W - 60 - d.textlength(tag, font=font(REG, 15)), H - 58), tag,
           font=font(REG, 15), fill=MUTED)
    return img


def build(base_dir, sections, title, subtitle, page_count):
    pages_dir = os.path.join(base_dir, "pages")
    os.makedirs(pages_dir, exist_ok=True)
    for i in range(page_count):
        img = draw_page(sections, title, subtitle, i + 1, page_count)
        path = os.path.join(pages_dir, f"{i + 1:02d}.webp")
        img.save(path, "WEBP", quality=82, method=6)
        print(f"  {path}  ({os.path.getsize(path) // 1024} KB)")


ROOT = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public", "menus",
)

def main():
    if not os.path.isdir(ROOT):
        raise SystemExit(f"No existe {ROOT}")

    print("Generando páginas de prueba:\n")
    build(os.path.join(ROOT, "lo-de-pepe", "carta"),
          MENU_CARTA, "La Carta", "Lo de Pepe · Todos los dias 12 a 23hs", 4)
    build(os.path.join(ROOT, "lo-de-pepe", "principales"),
          MENU_PRINCIPALES, "Platos Principales", "Lo de Pepe · Almuerzos y cenas", 2)
    build(os.path.join(ROOT, "lo-de-pepe", "bebidas"),
          MENU_BEBIDAS, "Bebidas", "Lo de Pepe", 3)


if __name__ == "__main__":
    main()