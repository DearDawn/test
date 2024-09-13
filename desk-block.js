class Block {
  constructor ({ name = '', w = 100, h = 100, l = 100 }) {
    this.models = [];
    this.dom = document.createElement('div');
    this.dom.className = 'block';
    this.dom.style.setProperty('--block-l', `${l}px`);
    this.dom.style.setProperty('--block-w', `${w}px`);
    this.dom.style.setProperty('--block-h', `${h}px`);

    const sides = ['front', 'left', 'right', 'bottom', 'back'];
    sides.forEach(side => {
      const sideDom = document.createElement('div');
      sideDom.className = `side ${side}`;
      this.dom.appendChild(sideDom);
    });

    this.updateBoundingRect();
  }

  setPosition ({ x, y, z }) {
    this.dom.style.setProperty('--block-x', `${x}px`);
    this.dom.style.setProperty('--block-y', `${y}px`);
    this.dom.style.setProperty('--block-z', `${z}px`);
    this.updateBoundingRect();
  }

  append (model) {
    this.models.push(model);
    this.dom.appendChild(model.dom);
  }

  updateBoundingRect () {
    const rect = this.dom.getBoundingClientRect();
    this.boundingRect = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  addClickListener (callback) {
    this.dom.addEventListener('click', callback);
  }

  removeClickListener (callback) {
    this.dom.removeEventListener('click', callback);
  }
}

class Mesh {
  constructor ({ w = 200, l = 200 }) {
    this.dom = document.createElement('div');
    this.dom.className = 'mesh';
    this.dom.style.position = 'absolute';
    this.dom.style.width = `${l}px`;
    this.dom.style.height = `${w}px`;

    this.dom.style.left = `0px`;
    this.dom.style.bottom = `0px`;
    this.updateBoundingRect();
  }

  updateBoundingRect () {
    const rect = this.dom.getBoundingClientRect();
    this.boundingRect = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  setPosition ({ x, y }) {
    this.dom.style.left = `${x}px`;
    this.dom.style.bottom = `${y}px`;
    this.updateBoundingRect();
  }

  addClickListener (callback) {
    this.dom.addEventListener('click', callback);
  }

  removeClickListener (callback) {
    this.dom.removeEventListener('click', callback);
  }
}
