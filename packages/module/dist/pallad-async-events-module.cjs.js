'use strict';

if (process.env.NODE_ENV === "production") {
  module.exports = require("./pallad-async-events-module.cjs.prod.js");
} else {
  module.exports = require("./pallad-async-events-module.cjs.dev.js");
}
