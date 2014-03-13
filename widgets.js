sagecell.require(["notebook/js/widgets/widget"], function(WidgetManager){
    var WebCameraView = IPython.DOMWidgetView.extend({
        render: function(){
            // based on https://developer.mozilla.org/en-US/docs/WebRTC/taking_webcam_photos
            var video        = $('<video>')[0];
            var canvas       = $('<canvas>')[0];
            var startbutton  = $('<button>Take Pic</button>')[0];
            var width = 320;
            var height = 0;
            var that = this;

            setTimeout(function() {that.$el.append(video).append(startbutton).append(canvas);}, 200);
            $(canvas).hide();
            var streaming = false;
            navigator.getMedia = ( navigator.getUserMedia ||
                                 navigator.webkitGetUserMedia ||
                                 navigator.mozGetUserMedia ||
                                 navigator.msGetUserMedia);

            navigator.getMedia({video: true, audio: false},
                function(stream) {
                  if (navigator.mozGetUserMedia) {
                    video.mozSrcObject = stream;
                  } else {
                    var vendorURL = window.URL || window.webkitURL;
                    video.src = vendorURL.createObjectURL(stream);
                  }
                  video.play();
                },
                function(err) {
                  console.log("An error occured! " + err);
                }
            );

            video.addEventListener('canplay', function(ev){
                if (!streaming) {
                  height = video.videoHeight / (video.videoWidth/width);
                  video.setAttribute('width', width);
                  video.setAttribute('height', height);
                  canvas.setAttribute('width', width);
                  canvas.setAttribute('height', height);
                  streaming = true;
                }
            }, false);
            function takepicture() {
                canvas.width = width;
                canvas.height = height;
                video.pause();
                $(video).fadeTo(1,0).delay(100).fadeTo(1,100);
                setTimeout(function() {video.play()}, 3000);
                canvas.getContext('2d').drawImage(video, 0, 0, width, height);
                that.model.set('imageurl',canvas.toDataURL('image/png'));
                that.touch();
            }
            startbutton.addEventListener('click', function(ev){
                takepicture();
                ev.preventDefault();
            }, false);
        },
    });
    WidgetManager.register_widget_view('WebCameraView', WebCameraView);

    var LinkView = IPython.WidgetView.extend({
        render: function(){
            _.each(this.model.get('widgets'), function(element, index, list) {
                var model = element[0], attr = element[1];
                model.on('change:'+attr, function() {this.update_value(element)}, this);
            }, this);
            this.update_value(this.model.get('widgets')[0]);
            // TODO: register for any destruction handlers
            this.update_bindings([], this.model.get('widgets'))
            this.model.on('change:widgets', function(model, value, options) {
                this.update_bindings(model.previous('widgets'), value);
            }, this)

        },
        update_bindings: function(oldlist, newlist) {
            var that = this
            this.do_diff(oldlist, newlist
                         function(elt) {elt[0].off('change:'+elt[1], null, that);},
                         function(elt) {elt[0].on('change:'+elt[1], 
                                                  function(model, value, options) {
                                                      that.update_value(elt, value)
                                                  }, that);})
        },
        update_value: function(elt, value) {
            if (this.updating) {return;}
            var model = elt[0];
            var attr = elt[1];
            this.updating = true;
            _.each(_.without(this.model.get('widgets'), elt), 
                   function(element, index, list) {
                       element[0].set(element[1], value);
                       element[0].save_changes();
                   }, this);
            this.updating = false;
        },
    });
    IPython.WidgetManager.register_widget_view('LinkView', LinkView);
});

// http://sagecell.sagemath.org/?z=eJylU21r2zAQ_h7IfxAZxTIYO-1aBqMqjA7GIGVjG-xDyAfZvlrKLMlI56b-9zs7Muk2OvYiDNKd7p7n7jm5D-CtNCCSvQzONt71mCwXy8ULhablq-tQed0hC74SiULswuui8PJwkTcaVV_mlTPFWSi6AZUH2IciYF-DxZMn34fk5ro4At2szvpImRJJ62TN_xW3G5KnYM8UTLilewSbG4kqP8igtG3Q2RzqvlDOQDF1_oTpucqJ41Tv_8BS4emo8d9JrLvhoOsGMBRGBgRfRPM3Av-i759C_qTtcqFN5zwy1AaWi85riyzZEDp1nec5PZnxJg8tQMcvpoyKUr0UX6G8nU588gblDvx4NdnIBHtvZANf4BF7D1yPRu-1WI2CN0BSoh8o6nOnwMO76OCeuPsgLimIRgBey5aCNtKU4PEuenjlWudFclAaIcmYkZ3AidcMrtxDNdLfQVB8JhLzYQw-goj5QIkVxX8EHzpK1Q8QO-tc0KidFdt1dj5-u4zduwdxuc5YpXRbe6C7t9qPWc7KdqMbhbG49eP9tDJ2gnmZXWXnBEIygyXnINb5VbqjAkIFFkY1xp2fwOd-MvbGlJp-lB8pXk1rQlguKKEmKT3BfIrHOBJRZWxmmHaq31n0rg3igy813kaLR3dL8xdVmsbBzsizvdH2G49vSmy3R5KMJXHIbUI9bvHk0Mlul041fgdN15U4&lang=sage


/*
from IPython.html.widgets import Widget, DOMWidget
from IPython.html import widgets
from IPython.utils.traitlets import Unicode, Bytes, Instance, Tuple, Any

html("<script src='http://boxen.math.washington.edu/home/jason/pythreejs/pythreejs.js'></script>")
load('http://boxen.math.washington.edu/home/jason/pythreejs/pythreejs.py')

html("<script src='https://raw2.github.com/%s/ipywidgets/master/widgets.js'></script>"%username)
load('https://rawgithub.com/%s/ipywidgets/master/widgets.py'%username)
import time
time.sleep(1)

a = widgets.FloatSliderWidget(value=30)
b = widgets.FloatSliderWidget()
c = widgets.FloatSliderWidget()
show(a)
show(b)
show(c)
print a.value, b.max
ll=Link(widgets=[[a,'value'], [b,'max']])
show(ll)
def p(name, new):
    c.value = new+1
b.on_trait_change(p, 'max')
*/
