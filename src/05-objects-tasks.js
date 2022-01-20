/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  const rect = {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
  return rect;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  const values = Object.values(obj);
  return new proto.constructor(...values);
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = {
  result: '',
  isElement: false,
  isId: false,
  isPseudoElement: false,
  order: 0,
  element(value) {
    if (this.isElement) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    if (this.order !== 0) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
    this.result += `${value}`;
    this.isElement = true;
    const c = { ...this };
    this.result = '';
    this.isElement = false;
    return c;
  },

  id(value) {
    if (this.isId) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    if (this.order > 1) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
    this.result += `#${value}`;
    this.isId = true;
    this.order = 1;
    const c = { ...this };
    this.order = 0;
    this.result = '';
    this.isId = false;
    return c;
  },

  class(value) {
    if (this.order > 2) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
    this.result += `.${value}`;
    this.order = 2;
    const c = { ...this };
    this.order = 0;
    this.result = '';
    return c;
  },

  attr(value) {
    if (this.order > 3) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
    this.result += `[${value}]`;
    this.order = 3;
    const c = { ...this };
    this.order = 0;
    this.result = '';
    return c;
  },

  pseudoClass(value) {
    if (this.order > 4) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
    this.result += `:${value}`;
    this.order = 4;
    const c = { ...this };
    this.order = 0;
    this.result = '';
    return c;
  },

  pseudoElement(value) {
    if (this.isPseudoElement) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    this.result += `::${value}`;
    this.order = 5;
    this.isPseudoElement = true;
    const c = { ...this };
    this.order = 0;
    this.result = '';
    this.isPseudoElement = false;
    return c;
  },

  combine(selector1, combinator, selector2) {
    const part1 = selector1.stringify();
    const part2 = selector2.stringify();
    this.result += `${part1} ${combinator} ${part2}`;
    const c = { ...this };
    this.result = '';
    return c;
  },

  stringify() {
    const res = this.result;
    this.result = '';
    return res;
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
