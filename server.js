var http = require("http");
var app = require("./app");

http.createServer(app).listen(8081);

console.log("Server running at http://127.0.0.1:8081/");
