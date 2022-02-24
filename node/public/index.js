var socket = io();
var dragged;
var imageURL;
/* events fired on the draggable target */
document.addEventListener("drag", function(event) {
  
}, false);

document.addEventListener("dragstart", function(event) {
  // store a ref. on the dragged elem
  dragged = event.target;
  // make it half transparent
  event.target.style.opacity = .5;
}, false);

document.addEventListener("dragend", function(event) {
  // reset the transparency
  event.target.style.opacity = "";
}, false);

/* events fired on the drop targets */
document.addEventListener("dragover", function(event) {
  // prevent default to allow drop
  event.preventDefault();
}, false);

document.addEventListener("dragenter", function(event) {
  // highlight potential drop target when the draggable element enters it
  if (event.target.className == "dropzone") {
    event.target.style.background = "purple";
  }
  
}, false);

document.addEventListener("dragleave", function(event) {
  // reset background of potential drop target when the draggable element leaves it
  if (event.target.className == "dropzone") {
    event.target.style.background = "";
  }
  
}, false);

document.addEventListener("drop", function(event) {
  // prevent default action (open as link for some elements)
  event.preventDefault();
  if(["pngDropDiv","imgDropDiv","scriptDropDiv"].includes(event.target.id)) {
    event.target.style.background = "#d9dbda";
    var files = event.dataTransfer.files;
    if(files.length === 1) {
      if(event.target.id == "pngDropDiv"){
        if(files[0].type.match('image.png')) {
          var sendFile=document.getElementById("sendPng");
          sendFile.files = files;
        } else {
          alert("Only PNG files are allowed");
        }
      } else if(event.target.id == "imgDropDiv") {
        if(files[0].type.match('image.*')) {
          var sendFile=document.getElementById("sendImg");
          sendFile.files = files;
        } else {
          alert("Only images are allowed");
        }
      } else if(event.target.id == "scriptDropDiv") {
        if(files[0].name.match('.js')) {
          var sendFile=document.getElementById("sendScript");
          sendFile.files = files;
        } else {
          alert("Only js scripts are allowed");
        }
      }
    } else {
      alert("Only one file at a time is allowed");
    }
  }
  
}, false);
function sendShow(){
  var sendFile=document.getElementById("sendPng");
  if(sendFile.files.length === 1) {
    var file = sendFile.files[0];
    if(file.type.match('image.png')) {
      file.arrayBuffer().then(function(buffer) {
        parts=Math.ceil(buffer.byteLength/1000000);
        socket.emit("imageInfo",{'parts':parts, "action":"show"});
        for(i=0;i<parts;i++){
          var start=i*1000000;
          var end=Math.min(buffer.byteLength,(i+1)*1000000);
          socket.emit("image",buffer.slice(start,end));
        }
      });
    } else {
      alert("Only PNG files are allowed");
    }
  } else if(sendFile.files.length > 1) {
    alert("Only one file at a time is allowed")
  } else{
    alert("No file selected");
  }
}

function sendHide(){
  var sendImg=document.getElementById("sendImg");
  var sendScript=document.getElementById("sendScript");
  if(sendImg.files.length === 1) {
    var img=sendImg.files[0];
    if(img.type.match('image.*')) {
      if(sendScript.files.length === 1) {
        var script=sendScript.files[0];
        if(script.name.match('.js')) {
          socket.emit("script",script);
          img.arrayBuffer().then(function(buffer) {
            parts=Math.ceil(buffer.byteLength/1000000);
            socket.emit("imageInfo",{'parts':parts, "action":"hide"});
            for(i=0;i<parts;i++){
              var start=i*1000000;
              var end=Math.min(buffer.byteLength,(i+1)*1000000);
              socket.emit("image",buffer.slice(start,end));
            }
          });
        } else {
          alert("Only js scripts are allowed");
        }
      } else if (sendScript.files.length > 1) {
        alert("Only one script at a time is allowed");
      } else {
        alert("No script selected");
      }
    } else {
      alert("Only images are allowed");
    }
  } else if(sendImg.files.length > 1) {
    alert("Only one image at a time is allowed")
  } else{
    alert("No image selected");
  }
}

function showPanel(){
  var showDiv=document.getElementById("showDiv");
  var hideDiv=document.getElementById("hideDiv");
  hideDiv.style.visibility="hidden";
  showDiv.style.visibility="visible";
}

function hidePanel(){
  var showDiv=document.getElementById("showDiv");
  var hideDiv=document.getElementById("hideDiv");
  showDiv.style.visibility="hidden";
  hideDiv.style.visibility="visible";
}

socket.on("jsCode", function(data) {
    var img= sendFile=document.getElementById("sendPng").files[0];
    imageURL = URL.createObjectURL(img);
    document.getElementById("showDiv").style.visibility = "hidden";
    dynObj=document.getElementById("dynObj");
    script=document.createElement("script");
    script.innerHTML=data;
    dynObj.appendChild(script);
});

socket.on("image", function(data) {
  var blob = new Blob([data], {type: "image/png"});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "result.png";
  document.body.append(link);
  link.click();
  link.remove();
});

socket.on('error', function(err) {
  alert(err);
});
