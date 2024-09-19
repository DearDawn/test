import { Scene } from './desk-scene.js';
import { Block, Mesh } from './desk-block.js';

console.log('[dodo] ', '111', 111);
console.log('[dodo] ', 'Scene', Scene);

const scene = new Scene(document.getElementById('scene'));
scene.showAxis();
scene.showPlain();
const table = new Block({ l: 400, w: 300, h: 20 });
const room = new Block({ l: 3000, w: 3000, h: 3000 });
table.setPosition(0, 0, 10);
room.setPosition(0, 1300, 1500);
const wall = new Mesh({ l: 600, w: 400, background: '#333' });
wall.setPosition(0, -150, 0);
wall.rotate(1, 0, 0, 90);
scene.append(table);
scene.append(wall);
scene.append(room);

const book = new Mesh({ l: 150, w: 100, background: 'pink' });
const phone = new Mesh({ l: 50, w: 100, background: 'yellow' });
book.setPosition(-100, 75, 0);
phone.setPosition(150, 75, 0);
table.append(book);
table.append(phone);

book.addClickListener((e) => {
  e.stopPropagation();
  if (scene.camera.bigMode) {
    scene.camera.reset();
  } else {
    scene.camera.focus(book.position.x, book.position.y);
  }
});

phone.addClickListener((e) => {
  e.stopPropagation();
  if (scene.camera.bigMode) {
    scene.camera.reset();
  } else {
    scene.camera.focus(phone.position.x, phone.position.y);
  }
});