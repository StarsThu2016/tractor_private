from PIL import Image
import os

# convert HD 691x1056 images to 71x96, 106x143, 142x192 images
if 1:
  numbers = ['A'] + [str(num) for num in range(2, 10)] + ['T', 'J', 'Q', 'K']
  colors = ['C', 'D', 'H', 'S']
  input_cards = ['hd/{}{}@3x'.format(number, color) for color in colors for number in numbers]
  numbers = [str(num) for num in range(1, 11)] + ['j', 'q', 'k']
  colors = ['c', 'd', 'h', 's']
  output_cards = ['{}{}'.format(color, number) for color in colors for number in numbers]  
  suffixes = ["", "_106w_28d", "_large"]
  whs = [(71, 96), (106, 143), (142, 192)]
  for input_card, output_card in zip(input_cards, output_cards):
    im = Image.open(input_card + '.png')
    for (width, height), suffix in zip(whs, suffixes):
      im2 = im.resize((width, height), Image.ANTIALIAS)
      im2.save(output_card + suffix + '.png')
  for card in ['Milli3', 'Andy3', 'b1fv']:
    im = Image.open(card + '.gif')
    for (width, height), suffix in zip(whs, suffixes):
      im2 = im.resize((width, height), Image.ANTIALIAS)
      im2.save(card + suffix + '.png')

# convert 71x images to 106x images
if 0:
  numbers = [str(num) for num in range(1, 11)] + ['j', 'q', 'k']
  colors = ['c', 'd', 'h', 's']
  cards = [color+number for color in colors for number in numbers] + ['Milli3', 'Andy3', 'b1fv']
  for card in cards:
    filename = '{}.gif'.format(card)
    im = Image.open(filename)

    width, height = im.size
    scale = 106/width
    width = int(width * scale)
    height = int(height * scale)
    im = im.resize((width, height), Image.ANTIALIAS)

    im.save('{}_106w_28d.gif'.format(card))

# convert 71x images to 142x images
if 0:
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
