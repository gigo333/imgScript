from aiohttp import web
import socketio
import os
import numpy as np
from PIL import Image
from io import BytesIO
from pyde import hideScript, showScript

# create a new aysnc socket io server
sio = socketio.AsyncServer()

#create a new Aiohttp web application
web_app = web.Application()

images={}
scripts={}

#bind the socket.io server to the web application instance
sio.attach(web_app)

#define endpoints 
async def index(request):
    dirname = os.path.dirname(__file__)
    #print(request)
    filename = os.path.join(dirname, './public/index.html')
    with open(filename) as file_obj:
        return web.Response(text = file_obj.read(), content_type='text/html')

async def handle(request):
    #print(request)
    request = request.match_info.get('name')
    filename ='./public/'+request
    if request == 'favicon.ico':
        return web.Response(status=404)
    
    if request.split('.')[-1] == 'css':
        with open(filename) as file_obj:
            return web.Response(text = file_obj.read(), content_type='text/css')

    with open(filename,'rb') as file_obj:
        return web.Response(body = file_obj.read())

web_app.router.add_get('/',index)
web_app.router.add_get('/{name}', handle)

utils=None
with open("utils.js", "r") as f:
    utils = f.read()

@sio.on('connect')
async def connect(id,msg,args):
    print("{} connected".format(id))

@sio.on('image')
async def image(id,msg):
    image=images[id]
    image['data']+=msg
    image['part']+=1
    if image['part']==image['parts']:
        f=BytesIO(image['data'])
        img=Image.open(f)
        del f
        if image['action']=='show':
            res=showScript(img)
            await sio.emit('jsCode', res, room=id)
        elif image['action']=='hide':
            res=hideScript(scripts[id], img)
            if(res):
                io=BytesIO()
                res.save(io, 'PNG')
                b=io.getvalue()
                del io
                await sio.emit('image', b, room=id)
            else:
                await sio.emit('error', 'Error: code is too long', room=id)
            scripts.pop(id)

        images.pop(id)

@sio.on('imageInfo')
async def imageParts(id,msg):
    images[id]={'parts':msg['parts'],'action':msg['action'], 'part':0, 'data':b''}
    
@sio.on('script')
async def script(id,msg):
    scripts[id]=msg

web.run_app(web_app, port=80, host="192.168.0.120")