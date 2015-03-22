module Sayings {
  export class Greeter {
    greeting: string;
    constructor(message: string) {
      this.greeting = message;
    }
    greet() {
      return "Hello, " + this.greeting;
    }
  }
}
var greeter = new Sayings.Greeter("world");

var button = document.createElement('button');
button.textContent = "Say Hello";
button.onclick = function() {
  alert(greeter.greet());
};

document.body.appendChild(button);

declare var io: (string)=> any;
var socket = io('ws://' + window.location.hostname + ':8000/' );