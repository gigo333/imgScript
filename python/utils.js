dynObj=document.getElementById("dynObj");
d1=document.createElement("div");
btn=document.createElement("button");
btn.innerHTML="Click me";
btn.onclick=function() {
    alert("Hello");
}
d1.appendChild(btn);
image=document.createElement("img");
image.src=imageURL;
d1.appendChild(image);
dynObj.appendChild(d1);