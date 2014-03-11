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
            console.log('render');
        },
        update: function() {
            console.log('update');
        }
    }
    WidgetManager.register_widget_view('LinkView', LinkView);

});
