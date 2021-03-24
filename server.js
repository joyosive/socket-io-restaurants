const http = require("http"),
  url = require("url"),
  fs = require("fs"),
  io = require("socket.io"),
  Restaurant = require("./model/Restaurant"),
  Order = require("./model/Order");


const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/admin');
const connectionString = "mongodb://localhost:27017/admin";

mongoose
    .connect(connectionString, {  useNewUrlParser: true } )
    .then( () => { console.log("Mongoose connected successfully "); },
        error => { console.log("Mongoose could not connected to database: " + error);  }
        );





const server = http.createServer(function(req, res) {
  var path = url.parse(req.url).pathname;
  switch (path) {
    case "/":
      fs.readFile(__dirname + "/index.html", function(err, data) {
        if (err) return send404(res);
        res.writeHead(200, {
          "Content-Type": path == "json.js" ? "text/javascript" : "text/html"
        });
        res.write(data, "utf8");
        res.end();
      });
      break;

    default:
      send404(res);
  }
});
const send404 = function(res) {
  res.writeHead(404);
  res.write("404");
  res.end();
};

const PORT = 8080;
server.listen(PORT, () => console.log(`server started on localhost:${PORT}`));

// socket.io, I choose you
const ioServer = io.listen(server);

// socket.io setup and manager
ioServer.on("connection", function(socket) {
  // now we have a client object!
  console.log("Connection accepted.");

  // event listeners
  socket.on("message", function(message) {
    console.log(`Recieved message: ${message} - from client`);
    socket.emit("msgreceived");
  });

  socket.on("disconnect", function() {
    console.log("Disconnected...");
  });

  socket.on("get-restaurants", () => {
    console.log("server - get-restarants called");

    Restaurant.find({ city: 'Queens', cuisine: 'Delicatessen'},(error,documents) => {
      if (error) console.log(`Error occurred on Restaurant.find(): ${error}`);
      else {
        console.log(`Restaurant.find() returned documents: ${documents}`);
        const data = documents.map(x => {
          var restaurant = {name: x.name, cuisine: x.cuisine};
          return restaurant;
        });
        console.log(data)
        socket.emit("restaurants-data", JSON.stringify(data));
      }
    });
  });

  socket.on("get-orders", () => {
    console.log("server - orders-data called");

    Order.find((error, documents) => {
      if (error) console.log(`Error occurred on Order.find(): ${error}`);
      else {
        console.log(`Orders.find() returned documents: ${documents}`);
        const data = documents.map(x => x => x.name);
        socket.emit("orders-data", data);
      }
    });
  });

  socket.on("add-order", () => {
    console.log("server - add-order called");

    try {
      var newOrder = new Order({
        customer_name: 'Joy',
        item: 'Cheesecake',
        orderId: '300306'
      });

      newOrder.save((err,orderVal) => {

        if (err) console.log(`Error occurred on Order.find(): ${error}`);
        else {
          console.log("emit add-order-data")
          socket.emit("add-order-data", orderVal);
        }

      });

    } catch (e) {
      console.log(e);
    }



  });
});
