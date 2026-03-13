import { Card, DecryptoCodes } from './decrypto-card.interface';

export const StartGameCards: Card[] = [
  {
    id: '1',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescriptionEn: '...',
    cardDescriptionRu: '...',
  },
  {
    id: '1',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescriptionEn: '...',
    cardDescriptionRu: '...',
  },
  {
    id: '1',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescriptionEn: '...',
    cardDescriptionRu: '...',
  },
  {
    id: '1',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescriptionEn: '...',
    cardDescriptionRu: '...',
  },
];

export const GameCards: Card[] = [
  {
    id: '1',
    cardName: 'async',
    cardHints: ['await ', 'promise', 'try...catch'],
    cardDescriptionEn:
      'Asynchrony in JavaScript is a way to perform operations (such as server requests, timers, and file reads) without blocking the main flow of execution. This allows web pages to remain responsive: while data is being loaded, the interface does not hang. Async/await — syntactic sugar over promises. The async keyword before the function turns it into a returning promise, and await suspends the execution of the function until the result is received, making asynchronous code look like synchronous code.',
    cardDescriptionRu:
      'Асинхронность в JavaScript — это способ выполнять операции (например, запросы к серверу, таймеры, чтение файлов) не блокируя основной поток выполнения. Это позволяет веб-страницам оставаться отзывчивыми: пока идёт загрузка данных, интерфейс не зависает. Async/await — синтаксический сахар над промисами. Ключевое слово async перед функцией превращает её в возвращающую промис, а await приостанавливает выполнение функции до получения результата, делая асинхронный код похожим на синхронный.',
  },
  {
    id: '2',
    cardName: 'this',
    cardHints: ['context', 'arrow functions', 'call, apply, bind'],
    cardDescriptionEn:
      'In JavaScript, this is a special keyword that refers to the context object in which the function was called. Its value is not fixed and is determined solely by the way the function is called. Arrow functions do not have this. When this is accessed inside the arrow function, its value is taken from the outside.',
    cardDescriptionRu:
      'В JavaScript this — это специальное ключевое слово, которое ссылается на объект контекста, в котором была вызвана функция. Его значение не фиксировано и определяется исключительно способом вызова функции. У стрелочных функций нет this. Когда внутри стрелочной функции обращаются к this, то его значение берётся извне.',
  },
  {
    id: '3',
    cardName: 'let',
    cardHints: ['temporal dead zone', 'block scope', 'const'],
    cardDescriptionEn:
      'In JavaScript, let is a modern way of declaring variables, which has a block scope (accessible only inside {...}), supports value reassignment, but does not allow repeated declaration in the same scope. This is a safer replacement for the outdated var, preventing errors with variable visibility.',
    cardDescriptionRu:
      'let в JavaScript — это современный способ объявления переменных, который имеет блочную область видимости (доступна только внутри {...}), поддерживает переприсваивание значений, но не допускает повторного объявления в той же области. Это более безопасная замена устаревшему var, предотвращающая ошибки с видимостью переменных.',
  },
  {
    id: '4',
    cardName: 'closure',
    cardHints: ['lexical scoping', 'state retention', 'data encapsulation'],
    cardDescriptionEn:
      'A closure in JavaScript is a function that remembers its lexical environment even after executing an external function. It allows you to create private variables, save state between calls, and implement functional patterns. Key hints: access to the external area, memorization of variables, function within a function.',
    cardDescriptionRu:
      'Замыкание в JavaScript — это функция, запоминающая свое лексическое окружение даже после выполнения внешней функции. Оно позволяет создавать приватные переменные, сохранять состояние между вызовами и реализовывать функциональные паттерны. Ключевые подсказки: доступ к внешней области, запоминание переменных, функция внутри функции.',
  },
  {
    id: '5',
    cardName: 'fetch',
    cardHints: ['async/await', 'JSON parsing ', 'error handling'],
    cardDescriptionEn:
      'fetch in JavaScript is a modern method for sending network requests (receiving or sending data) to a Promises—based server. It replaces the old XMLHttpRequest, allowing you to update parts of the page without reloading. The method accepts URLs and options (methods, headers), returning a Response.',
    cardDescriptionRu:
      'fetch в JavaScript — это современный метод для отправки сетевых запросов (получение или отправка данных) на сервер, работающий на основе промисов (Promises). Он заменяет старый XMLHttpRequest, позволяя обновлять части страницы без перезагрузки. Метод принимает URL и опции (методы, заголовки), возвращая ответ Response.',
  },
  {
    id: '6',
    cardName: 'function',
    cardHints: ['define call ', 'parameters arguments', 'return value'],
    cardDescriptionEn:
      'A function in JS is a self—contained block of code (a subroutine) that performs a specific task and can be reused. It accepts input data (arguments), processes them, and returns the result. In fact, it is an object that can be created, passed, and stored in variables.',
    cardDescriptionRu:
      'Функция в JS — это самодостаточный блок кода (подпрограмма), выполняющий определенную задачу, который можно многократно использовать. Она принимает входные данные (аргументы), обрабатывает их и возвращает результат. По сути, это объект, который можно создавать, передавать и сохранять в переменных. ',
  },
  {
    id: '7',
    cardName: 'object',
    cardHints: ['key-value pairs', 'property collection', 'reference type'],
    cardDescriptionEn:
      'An object in JavaScript is a structural data type that is an unordered collection of key:value pairs. It is a key building block of a language used to store complex data and related functions (methods). Keys (properties) are strings or characters, and values can be of any type.',
    cardDescriptionRu:
      'Объект (Object) в JavaScript — это структурный тип данных, представляющий собой неупорядоченную коллекцию пар «ключ: значение». Это ключевой строительный блок языка, используемый для хранения сложных данных и связанных функций (методов). Ключи (свойства) — это строки или символы, а значения могут быть любого типа.',
  },
  {
    id: '8',
    cardName: 'array',
    cardHints: ['ordered list', 'index access', 'dynamic size'],
    cardDescriptionEn:
      'An array in JS is an ordered collection of data of any type (strings, numbers, objects) stored in a single variable. The elements are indexed from 0. Arrays are dynamic (change size) and have a property.length and many built-in methods for data manipulation.',
    cardDescriptionRu:
      'Array (массив) в JS — это упорядоченная коллекция данных любого типа (строки, числа, объекты), хранящаяся в одной переменной. Элементы индексируются с 0. Массивы динамичны (изменяют размер), имеют свойство .length и множество встроенных методов для манипуляции данными.',
  },
  {
    id: '9',
    cardName: 'loop',
    cardHints: ['iterate arrays', 'repeat logic', 'automate tasks'],
    cardDescriptionEn:
      'Loops in JS are constructs for repeatedly executing a block of code as long as a given condition is true. The main types are for (a known number of iterations), while (until a condition is met), and do...while. They reduce code duplication by allowing arrays and objects to be iterated over, stopping automatically when the condition becomes false.',
    cardDescriptionRu:
      'Циклы (loop) в JS — это конструкции для многократного выполнения блока кода, пока истинно заданное условие. Основные типы: for (известное число итераций), while (до выполнения условия) и do...while. Они сокращают дублирование кода, позволяя перебирать массивы и объекты, автоматически останавливаясь, когда условие становится ложным.',
  },
  {
    id: '10',
    cardName: 'class',
    cardHints: ['сonstructor ', 'object template', 'inheritance structure'],
    cardDescriptionEn:
      'A class in JavaScript is a template for creating objects that describes their properties and methods. It provides a structured way to work with inheritance, making the code more readable. Classes are special functions defined via class, instances of which are created by the new operator.',
    cardDescriptionRu:
      'Class в JavaScript — это шаблон для создания объектов, описывающий их свойства и методы. Он обеспечивает структурированный способ работы с наследованием, делая код более читаемым. Классы — это специальные функции, определяемые через class, экземпляры которых создаются оператором new.',
  },
];

export const DECRYPTO_CODES: DecryptoCodes = {
  1: [1, 2, 3],
  2: [1, 2, 4],
  3: [1, 3, 2],
  4: [1, 3, 4],
  5: [1, 4, 2],
  6: [1, 4, 3],
  7: [2, 1, 3],
  8: [2, 1, 4],
  9: [2, 3, 1],
  10: [2, 3, 4],
  11: [2, 4, 1],
  12: [2, 4, 3],
  13: [3, 1, 2],
  14: [3, 1, 4],
  15: [3, 2, 1],
  16: [3, 2, 4],
  17: [3, 4, 1],
  18: [3, 4, 2],
  19: [4, 1, 2],
  20: [4, 1, 3],
  21: [4, 2, 1],
  22: [4, 2, 3],
  23: [4, 3, 1],
  24: [4, 3, 1],
};
