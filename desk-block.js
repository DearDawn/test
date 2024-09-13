class BasicObject {
  constructor ({ name = 'basic', prefix = 'basic', w = 100, h = 100, l = 100 }) {
    this.dom = document.createElement('div');
    this.dom.className = name;
    this.prefix = prefix;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 1, deg: 0 };
    this.dom.style.setProperty(`--${this.prefix}-l`, `${l}px`);
    this.dom.style.setProperty(`--${this.prefix}-w`, `${w}px`);
    this.dom.style.setProperty(`--${this.prefix}-h`, `${h}px`);
  }

  setPosition (x, y, z) {
    this.dom.style.setProperty(`--${this.prefix}-x`, `${x}px`);
    this.dom.style.setProperty(`--${this.prefix}-y`, `${y}px`);
    this.dom.style.setProperty(`--${this.prefix}-z`, `${z}px`);
    this.position = { x, y, z };
  }

  rotate (x = 0, y = 0, z = 1, deg = 90) {
    this.dom.style.setProperty(`--${this.prefix}-rx`, `${x}`);
    this.dom.style.setProperty(`--${this.prefix}-ry`, `${y}`);
    this.dom.style.setProperty(`--${this.prefix}-rz`, `${z}`);
    this.dom.style.setProperty(`--${this.prefix}-r`, `${deg}deg`);
    this.rotation = { x, y, z, deg };
  }

  addClickListener (callback) {
    this.dom.addEventListener('click', callback);
  }

  removeClickListener (callback) {
    this.dom.removeEventListener('click', callback);
  }

  append (model) {
    this.models.push(model);
    this.dom.appendChild(model.dom);
  }
}

export class Block extends BasicObject {
  constructor (props) {
    super({ ...props, prefix: 'block', name: 'block' });
    this.models = [];

    const sides = ['front', 'left', 'right', 'bottom', 'back'];
    sides.forEach(side => {
      const sideDom = document.createElement('div');
      sideDom.className = `side ${side}`;
      this.dom.appendChild(sideDom);
    });
  }
}

export class Mesh extends BasicObject {
  constructor (props = { background: '#fff' }) {
    super({ ...props, prefix: 'mesh', name: 'mesh' });
    const { background } = props || {};
    this.prefix = 'mesh';
    this.dom.className = 'mesh';
    this.dom.style.background = background;
  }
}
