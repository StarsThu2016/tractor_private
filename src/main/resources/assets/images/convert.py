from PIL import Image
import os

numbers = [str(num) for num in range(1, 11)] + ['j', 'q', 'k']
colors = ['c', 'd', 'h', 's']
cards = [color+number for color in colors for number in numbers] + ['Milli3', 'Andy3', 'b1fv']

for card in cards:
  filename = '{}.gif'.format(card)
  im = Image.open(filename)

  width, height = im.size
  scale = 142/width
  width = int(width * scale)
  height = int(height * scale)
  im = im.resize((width, height), Image.ANTIALIAS)

  im.save('{}_large.gif'.format(card))