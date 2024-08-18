class ObservableValue {
  constructor(initialValue) {
    this.value = initialValue;
    this.observers = new Set();
  }

  get() {
    return this.value;
  }

  set(newValue) {
    this.value = newValue;
    this.notifyObservers();
  }

  observe(observer) {
    this.observers.add(observer);
  }

  unobserve(observer) {
    this.observers.delete(observer);
  }

  notifyObservers() {
    this.observers.forEach(observer => observer());
  }
}

class ComputedValue {
  constructor(derivedFunction, dependencies) {
    this.derivedFunction = derivedFunction;
    this.dependencies = dependencies;
    this.value = null;
    this.observers = new Set();
    this.isDirty = true;
  }

  get() {
    if (this.isDirty) {
      this.value = this.derivedFunction();
      this.isDirty = false;
      this.notifyObservers();
    }
    return this.value;
  }

  observe(observer) {
    this.observers.add(observer);
  }

  unobserve(observer) {
    this.observers.delete(observer);
  }

  notifyObservers() {
    this.observers.forEach(observer => observer());
  }
}

// 使用示例
const count = new ObservableValue(0);
const message = new ObservableValue('Hello, MobX!');

const countMessage = new ComputedValue(
  () => `The count is ${count.get()}`,
  [count]
);

count.observe(() => {
  console.log('Count changed:', countMessage.get());
});

count.set(1);
count.set(2);