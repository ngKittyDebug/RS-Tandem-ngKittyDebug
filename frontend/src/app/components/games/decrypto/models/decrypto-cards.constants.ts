import { Card, DecryptoCodes } from './decrypto-card.interface';

export const StartGameCards: Card[] = [
  {
    id: '1',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescription: {
      en: '...',
      ru: '...',
    },
  },
  {
    id: '2',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescription: {
      en: '...',
      ru: '...',
    },
  },
  {
    id: '3',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescription: {
      en: '...',
      ru: '...',
    },
  },
  {
    id: '4',
    cardName: '...',
    cardHints: ['', '', ''],
    cardDescription: {
      en: '...',
      ru: '...',
    },
  },
];

export const GameCards: Card[] = [
  {
    id: '1',
    cardName: 'async',
    cardHints: ['await ', 'promise', 'try...catch'],
    cardDescription: {
      en: 'Asynchrony in JavaScript is a way to perform operations (such as server requests, timers, and file reads) without blocking the main flow of execution. This allows web pages to remain responsive: while data is being loaded, the interface does not hang. Async/await — syntactic sugar over promises. The async keyword before the function turns it into a returning promise, and await suspends the execution of the function until the result is received, making asynchronous code look like synchronous code.',
      ru: 'Асинхронность в JavaScript — это способ выполнять операции (например, запросы к серверу, таймеры, чтение файлов) не блокируя основной поток выполнения. Это позволяет веб-страницам оставаться отзывчивыми: пока идёт загрузка данных, интерфейс не зависает. Async/await — синтаксический сахар над промисами. Ключевое слово async перед функцией превращает её в возвращающую промис, а await приостанавливает выполнение функции до получения результата, делая асинхронный код похожим на синхронный.',
    },
  },
  {
    id: '2',
    cardName: 'this',
    cardHints: ['context', 'arrow functions', 'call, apply, bind'],
    cardDescription: {
      en: 'In JavaScript, this is a special keyword that refers to the context object in which the function was called. Its value is not fixed and is determined solely by the way the function is called. Arrow functions do not have this. When this is accessed inside the arrow function, its value is taken from the outside.',
      ru: 'В JavaScript this — это специальное ключевое слово, которое ссылается на объект контекста, в котором была вызвана функция. Его значение не фиксировано и определяется исключительно способом вызова функции. У стрелочных функций нет this. Когда внутри стрелочной функции обращаются к this, то его значение берётся извне.',
    },
  },
  {
    id: '3',
    cardName: 'let',
    cardHints: ['temporal dead zone', 'block scope', 'const'],
    cardDescription: {
      en: 'In JavaScript, let is a modern way of declaring variables, which has a block scope (accessible only inside {...}), supports value reassignment, but does not allow repeated declaration in the same scope. This is a safer replacement for the outdated var, preventing errors with variable visibility.',
      ru: 'let в JavaScript — это современный способ объявления переменных, который имеет блочную область видимости (доступна только внутри {...}), поддерживает переприсваивание значений, но не допускает повторного объявления в той же области. Это более безопасная замена устаревшему var, предотвращающая ошибки с видимостью переменных.',
    },
  },
  {
    id: '4',
    cardName: 'closure',
    cardHints: ['lexical scoping', 'state retention', 'data encapsulation'],
    cardDescription: {
      en: 'A closure in JavaScript is a function that remembers its lexical environment even after executing an external function. It allows you to create private variables, save state between calls, and implement functional patterns. Key hints: access to the external area, memorization of variables, function within a function.',
      ru: 'Замыкание в JavaScript — это функция, запоминающая свое лексическое окружение даже после выполнения внешней функции. Оно позволяет создавать приватные переменные, сохранять состояние между вызовами и реализовывать функциональные паттерны. Ключевые подсказки: доступ к внешней области, запоминание переменных, функция внутри функции.',
    },
  },
  {
    id: '5',
    cardName: 'fetch',
    cardHints: ['async/await', 'JSON parsing ', 'error handling'],
    cardDescription: {
      en: 'fetch in JavaScript is a modern method for sending network requests (receiving or sending data) to a Promises—based server. It replaces the old XMLHttpRequest, allowing you to update parts of the page without reloading. The method accepts URLs and options (methods, headers), returning a Response.',
      ru: 'fetch в JavaScript — это современный метод для отправки сетевых запросов (получение или отправка данных) на сервер, работающий на основе промисов (Promises). Он заменяет старый XMLHttpRequest, позволяя обновлять части страницы без перезагрузки. Метод принимает URL и опции (методы, заголовки), возвращая ответ Response.',
    },
  },
  {
    id: '6',
    cardName: 'function',
    cardHints: ['define call ', 'parameters arguments', 'return value'],
    cardDescription: {
      en: 'A function in JS is a self—contained block of code (a subroutine) that performs a specific task and can be reused. It accepts input data (arguments), processes them, and returns the result. In fact, it is an object that can be created, passed, and stored in variables.',
      ru: 'Функция в JS — это самодостаточный блок кода (подпрограмма), выполняющий определенную задачу, который можно многократно использовать. Она принимает входные данные (аргументы), обрабатывает их и возвращает результат. По сути, это объект, который можно создавать, передавать и сохранять в переменных. ',
    },
  },
  {
    id: '7',
    cardName: 'object',
    cardHints: ['key-value pairs', 'property collection', 'reference type'],
    cardDescription: {
      en: 'An object in JavaScript is a structural data type that is an unordered collection of key:value pairs. It is a key building block of a language used to store complex data and related functions (methods). Keys (properties) are strings or characters, and values can be of any type.',
      ru: 'Объект (Object) в JavaScript — это структурный тип данных, представляющий собой неупорядоченную коллекцию пар «ключ: значение». Это ключевой строительный блок языка, используемый для хранения сложных данных и связанных функций (методов). Ключи (свойства) — это строки или символы, а значения могут быть любого типа.',
    },
  },
  {
    id: '8',
    cardName: 'array',
    cardHints: ['ordered list', 'index access', 'dynamic size'],
    cardDescription: {
      en: 'An array in JS is an ordered collection of data of any type (strings, numbers, objects) stored in a single variable. The elements are indexed from 0. Arrays are dynamic (change size) and have a property.length and many built-in methods for data manipulation.',
      ru: 'Array (массив) в JS — это упорядоченная коллекция данных любого типа (строки, числа, объекты), хранящаяся в одной переменной. Элементы индексируются с 0. Массивы динамичны (изменяют размер), имеют свойство .length и множество встроенных методов для манипуляции данными.',
    },
  },
  {
    id: '9',
    cardName: 'loop',
    cardHints: ['iterate arrays', 'repeat logic', 'automate tasks'],
    cardDescription: {
      en: 'Loops in JS are constructs for repeatedly executing a block of code as long as a given condition is true. The main types are for (a known number of iterations), while (until a condition is met), and do...while. They reduce code duplication by allowing arrays and objects to be iterated over, stopping automatically when the condition becomes false.',
      ru: 'Циклы (loop) в JS — это конструкции для многократного выполнения блока кода, пока истинно заданное условие. Основные типы: for (известное число итераций), while (до выполнения условия) и do...while. Они сокращают дублирование кода, позволяя перебирать массивы и объекты, автоматически останавливаясь, когда условие становится ложным.',
    },
  },
  {
    id: '10',
    cardName: 'class',
    cardHints: ['сonstructor ', 'object template', 'inheritance structure'],
    cardDescription: {
      en: 'A class in JavaScript is a template for creating objects that describes their properties and methods. It provides a structured way to work with inheritance, making the code more readable. Classes are special functions defined via class, instances of which are created by the new operator.',
      ru: 'Class в JavaScript — это шаблон для создания объектов, описывающий их свойства и методы. Он обеспечивает структурированный способ работы с наследованием, делая код более читаемым. Классы — это специальные функции, определяемые через class, экземпляры которых создаются оператором new.',
    },
  },
  {
    id: '11',
    cardName: 'NaN',
    cardHints: ['Invalid Calculation', 'Numeric Type', 'Not Number'],
    cardDescription: {
      en: 'NaN (short for Not-a-Number, "not a number") in JavaScript is a special value of the "number" type, which indicates the result of an incorrect or indefinite mathematical operation. typeof NaN will return "number", although technically it is "not a number".',
      ru: 'NaN (сокращение от Not-a-Number, «не число») в JavaScript — это специальное значение типа «число» (number), которое обозначает результат некорректной или неопределенной математической операции. typeof NaN вернет "number", хотя технически это «не число».',
    },
  },
  {
    id: '12',
    cardName: 'console',
    cardHints: ['Log Data', 'Debug Code', 'Inspect Objects'],
    cardDescription: {
      en: "A console in JavaScript is an embedded object that provides access to the browser's debugging console (or environment Node.js ). It allows developers to output messages, check the values of variables, and track errors in the code.",
      ru: 'Console (консоль) в JavaScript — это встроенный объект, предоставляющий доступ к отладочной консоли браузера (или среды Node.js). Она позволяет разработчикам выводить сообщения, проверять значения переменных и отслеживать ошибки в коде.',
    },
  },
  {
    id: '13',
    cardName: 'RegExp',
    cardHints: ['Pattern Matching', 'String Search', 'Text Validation'],
    cardDescription: {
      en: 'Regular expressions (RegExp) in JavaScript is a powerful tool for searching, replacing, and verifying substrings in strings based on the use of special templates. They are an object that defines a search pattern used to match sequences of characters.',
      ru: 'Регулярные выражения (RegExp) в JavaScript — это мощный инструмент для поиска, замены и проверки подстрок в строках, основанный на использовании специальных шаблонов. Они представляют собой объект, который определяет шаблон поиска, используемый для сопоставления последовательностей символов.',
    },
  },
  {
    id: '14',
    cardName: 'Set',
    cardHints: ['Unique values', 'Fast lookup', 'No duplicates'],
    cardDescription: {
      en: 'Set objects are a collection of values. A value in a Set can occur only once; it is unique in the collection. You can iterate through the set elements in the insertion order. The insertion order corresponds to the order in which each item was successfully inserted into the collection by the add() method (that is, when add() was called, there was no such item in the set yet).',
      ru: 'Объекты "Set" - это коллекция значений. Значение в Set может встречаться только один раз; оно уникально в коллекции. Вы можете перебирать элементы набора в порядке вставки. Порядок вставки соответствует порядку, в котором каждый элемент был успешно вставлен в коллекцию методом add() (то есть, когда был вызван add(), в наборе ещё не было такого элемента).',
    },
  },
  {
    id: '15',
    cardName: 'undefined',
    cardHints: ['Implicitly set', 'Missing value', 'Not assigned'],
    cardDescription: {
      en: 'Undefined is a data type in JavaScript. This is a primitive value that is assigned to a variable declared without initializing or assigning any value to it. By default, the variable is saved with the Undefined value.',
      ru: 'Undefined — это тип данных в JavaScript. Это примитивное значение, которое присваивается переменной, объявленной без инициализации или присвоения ей какого-либо значения. По умолчанию переменная сохраняется со значением Undefined.',
    },
  },
  {
    id: '16',
    cardName: 'null',
    cardHints: ['Intentional absence', 'Empty object', 'Assigned value'],
    cardDescription: {
      en: "In JavaScript, `null` indicates the deliberate absence of any object value. It's a primitive value that denotes the absence of a value or serves as a placeholder for an object that isn't present. `null` differs from `undefined`, which signifies a variable that has been declared but hasn't been assigned a value.",
      ru: 'В JavaScript "null" указывает на намеренное отсутствие какого-либо значения объекта. Это примитивное значение, которое обозначает отсутствие значения или служит заполнителем для объекта, которого нет. `null` отличается от `undefined`, что означает переменную, которая была объявлена, но которой не было присвоено значение.',
    },
  },
  {
    id: '17',
    cardName: 'Promise',
    cardHints: ['Pending / Settled', 'Resolve / Reject', 'Then / Catch'],
    cardDescription: {
      en: 'JavaScript Promises make handling asynchronous operations like API calls, file loading, or time delays easier. Think of a Promise as a placeholder for a value that will be available in the future. It can be in one of three states: pending (The task is in the initial state), fulfilled (The task was completed successfully, and the result is available), rejected (The task failed, and an error is provided)',
      ru: 'Promises в JavaScript упрощают обработку асинхронных операций, таких как вызовы API, загрузка файлов или временные задержки. Думайте о обещании как о заполнителе значения, которое будет доступно в будущем. Оно может находиться в одном из трех состояний: pending (задача находится в исходном состоянии), fulfilled (задача была успешно выполнена, и результат доступен), rejected (задача не выполнена, и выдано сообщение об ошибке).',
    },
  },
  {
    id: '18',
    cardName: 'switch',
    cardHints: ['Case Value', 'Break Statement', 'Default Clause'],
    cardDescription: {
      en: 'The switch construct in JavaScript is a conditional statement that replaces several if-else checks at once. It is useful when you need to compare one variable with many specific values. The switch operator first evaluates its expression. Then it searches for the first case clause, the value of which matches the result of the input expression (using a strict equality comparison), and passes control to that clause by following all instructions following that clause.',
      ru: 'Конструкция switch в JavaScript — это условный оператор, который заменяет сразу несколько проверок if-else. Он удобен, когда нужно сравнить одну переменную с множеством конкретных значений. Оператор switch сначала вычисляет свое выражение. Затем он ищет первое предложение case, значение выражения которого совпадает с результатом входного выражения (используя сравнение на основе строгого равенства), и передает управление этому предложению, выполняя все инструкции, следующие за этим предложением.',
    },
  },
  {
    id: '19',
    cardName: 'Temporal Dead Zone',
    cardHints: ['Reference Error', 'Before Initialization', 'Hoisting Trap'],
    cardDescription: {
      en: 'The Temporary Dead Zone (TDZ, temporary dead zone) is the period of time from the beginning of the scope (block of code) to the moment when a variable is declared using let or const. At this time, the variable already exists, but accessing it causes a ReferenceError error.',
      ru: 'Temporal Dead Zone (TDZ, временная мертвая зона) — это период времени от начала области видимости (блока кода) до момента объявления переменной с помощью let или const. В это время переменная уже существует, но обращение к ней вызывает ошибку ReferenceError.',
    },
  },
  {
    id: '20',
    cardName: 'Hoisting',
    cardHints: ['Declarations first', 'Top move', 'Initialization stays'],
    cardDescription: {
      en: 'Hoisting is a mechanism in JavaScript in which declarations of variables, functions, or classes are "moved" to the beginning of their scope (up the current script or function) before executing the code. Only declarations are raised, not initialization: values are assigned only in the line where they are written.',
      ru: 'Hoisting (поднятие) — это механизм в JavaScript, при котором объявления переменных, функций или классов «перемещаются» в начало своей области видимости (вверх текущего скрипта или функции) перед выполнением кода. Поднимаются только объявления, а не инициализация: значения присваиваются только в той строке, где они написаны.',
    },
  },
  {
    id: '21',
    cardName: 'const',
    cardHints: ['Immutable reference', 'Block scope', 'Initial value'],
    cardDescription: {
      en: 'The keyword `const` in JavaScript is a modern way of declaring variables, introduced in ES6. It is used to declare variables, the values of which must remain constant throughout the entire duration of the application. The const parameter has a block scope, similar to let, and is useful for ensuring immutability in your code. Unlike let, the main feature of const is that it cannot be reassigned after initialization.',
      ru: 'Ключевое слово `const` в JavaScript — это современный способ объявления переменных, введенный в ES6. Оно используется для объявления переменных, значения которых должны оставаться постоянными на протяжении всего времени работы приложения. Параметр const имеет блочную область видимости, подобно let, и полезен для обеспечения неизменяемости в вашем коде. В отличие от let, основная особенность const заключается в том, что его нельзя переназначить после инициализации.',
    },
  },
  {
    id: '22',
    cardName: 'var',
    cardHints: ['Legacy Keyword', 'Function Scoped', 'Hoisting Enabled'],
    cardDescription: {
      en: 'Var is a keyword in JavaScript used to declare variables. This is an old way of declaring (before ES6/2015), which has a number of features that distinguish it from modern let and const. Variables declared via var are visible throughout the function in which they are created, regardless of block levels (for example, inside if or for).  var variables are "lifted" to the beginning of their scope. var variables can be declared repeatedly in the same scope without errors.',
      ru: 'Var — это ключевое слово в JavaScript, используемое для объявления переменных. Это старый способ объявления (до ES6/2015), который имеет ряд особенностей, отличающих его от современных let и const. Переменные, объявленные через var, видны во всей функции, в которой они созданы, независимо от блочных уровней (например, внутри if или for).  Переменные var «поднимаются» в начало своей области видимости. Переменные var можно объявлять повторно в одной и той же области видимости без ошибок.',
    },
  },
  {
    id: '23',
    cardName: 'try...catch',
    cardHints: ['Error Handling', 'Catch Exceptions', 'Prevent Crashing'],
    cardDescription: {
      en: 'The try...catch construct in JavaScript is used to handle errors that may occur during code execution, so that the program does not "crash", but continues to work. The try...catch construct tries to execute the instructions in the try block, and, in case of an error, executes the catch block. The try construct contains a try block containing one or more instructions (the ({} ) block must be present, even if only one instruction is executed), and at least one catch or finally block.',
      ru: 'Конструкция try...catch в JavaScript используется для обработки ошибок, которые могут возникнуть во время выполнения кода, чтобы программа не «падала», а продолжала работать. Конструкция try...catch пытается выполнить инструкции в блоке try, и, в случае ошибки, выполняет блок catch. Конструкция try содержит блок try, в котором находится одна или несколько инструкций (Блок ({} ) обязательно должен присутствовать, даже если выполняется всего одна инструкция), и хотя бы один блок catch или finally.',
    },
  },
  {
    id: '24',
    cardName: 'throw',
    cardHints: ['Custom error', 'Stop execution', 'Trigger catch'],
    cardDescription: {
      en: 'The throw instruction allows you to generate user-defined exceptions. In this case, the execution of the current function will be stopped (instructions after the throw will not be executed), and control will be transferred to the first catch block in the call stack. If there are no catch blocks among the called functions, the program execution will be stopped.  It is used to handle situations when the data is incorrect or the program execution cannot be continued.',
      ru: 'Инструкция throw позволяет генерировать исключения, определяемые пользователем. При этом выполнение текущей функции будет остановлено (инструкции после throw не будут выполнены), и управление будет передано в первый блок catch в стеке вызовов. Если catch блоков среди вызванных функций нет, выполнение программы будет остановлено.  Используется для обработки ситуаций, когда данные некорректны или выполнение программы невозможно продолжать. ',
    },
  },
  {
    id: '25',
    cardName: 'instanceof',
    cardHints: ['Check prototype', 'Inheritance link', 'Object type'],
    cardDescription: {
      en: 'The instanceof operator checks whether an object belongs to a specific class. In other words, the object instanceof constructor checks whether the constructor.prototype object is present in the object prototype chain. It returns a boolean value, if true, it indicates that the object is an instance of a certain class, and if false, it is not.',
      ru: 'Оператор instanceof проверяет, принадлежит ли объект к определённому классу. Другими словами, object instanceof constructor проверяет, присутствует ли объект constructor.prototype в цепочке прототипов object. Он возвращает логическое значение, если true, то это указывает на то, что объект является экземпляром определенного класса, а если false, то это не так.',
    },
  },
  {
    id: '26',
    cardName: 'typeof',
    cardHints: ['Check Type', 'Data Type', 'Variable Inspection'],
    cardDescription: {
      en: 'The typeof operator in JavaScript is used to determine the data type of a value or variable. It returns a string indicating the type, such as "string", "number", "boolean", "object", etc. Used without parentheses (typeof x) or with parentheses (typeof(x)). typeof null returns "object", not "null". This is considered a bug in the very first version of JavaScript, which was left out for compatibility.',
      ru: 'Оператор typeof в JavaScript используется для определения типа данных значения или переменной. Он возвращает строку, указывающую на тип, например "string", "number", "boolean", "object" и т.д. Используется без скобок (typeof x) или со скобками (typeof(x)). typeof null возвращает "object", а не "null". Это считается ошибкой в самой первой версии JavaScript, которую оставили для совместимости.',
    },
  },
  {
    id: '27',
    cardName: 'JSON',
    cardHints: ['Parse String', 'Stringify Object', 'Data Format'],
    cardDescription: {
      en: 'JSON (JavaScript Object Notation) is a light text data exchange format based on the syntax of JavaScript objects. JSON is a syntax for serializing objects, arrays, numbers, strings of boolean values, and null values. It is based on JavaScript syntax, but still differs from it: not every JavaScript code is JSON, and not every JSON is JavaScript code.',
      ru: 'JSON (JavaScript Object Notation) — это легкий текстовый формат обмена данными, основанный на синтаксисе объектов JavaScript. JSON является синтаксисом для сериализации объектов, массивов, чисел, строк логических значений и значения null. Он основывается на синтаксисе JavaScript, однако всё же отличается от него: не каждый код на JavaScript является JSON, и не каждый JSON является кодом на JavaScript.',
    },
  },
  {
    id: '28',
    cardName: 'localStorage ',
    cardHints: ['String', 'Persistent Storage', 'Key-Value'],
    cardDescription: {
      en: 'The localStorage property allows you to access the Storage object. localStorage is similar to the sessionStorage property. The only difference is that the sessionStorage property stores data during the session (until the browser is closed), unlike the data in the localStorage property, which has no storage time limits and can only be deleted using JavaScript. Keys and values are always strings (just like objects, integer keys will automatically be converted to strings).',
      ru: 'Свойство localStorage позволяет получить доступ к Storage объекту. localStorage аналогично свойству sessionStorage. Разница только в том, что свойство sessionStorage хранит данные в течение сеанса (до закрытия браузера), в отличие от данных, находящихся в свойстве localStorage, которые не имеют ограничений по времени хранения и могут быть удалены только с помощью JavaScript. Ключи и значения всегда строки (так же, как и объекты, целочисленные ключи автоматически будут преобразованы в строки).',
    },
  },
  {
    id: '29',
    cardName: 'recursion',
    cardHints: ['Base Case', 'Stack Depth', 'Self Call'],
    cardDescription: {
      en: 'Recursion in JavaScript is a programming technique in which a function calls itself inside its body. It is used to break down a complex task into simpler, similar subtasks.',
      ru: 'Рекурсия в JavaScript — это приём программирования, при котором функция вызывает саму себя внутри своего тела. Она используется для разбиения сложной задачи на более простые, аналогичные подзадачи.',
    },
  },
  {
    id: '30',
    cardName: 'symbol',
    cardHints: ['Unique identity', 'Hidden property', 'Collision avoidance'],
    cardDescription: {
      en: 'A symbol is a primitive data type used to create unique identifiers. Symbols are created by calling the Symbol() function, to which you can pass the description (name) of the symbol. Even if the characters have the same name, they are different characters.',
      ru: 'Символ (symbol) – примитивный тип данных, использующийся для создания уникальных идентификаторов. Символы создаются вызовом функции Symbol(), в которую можно передать описание (имя) символа. Даже если символы имеют одно и то же имя, это – разные символы. ',
    },
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
