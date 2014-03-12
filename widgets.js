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
                model.on('change', function() {this.update_value(element)}, this);
            }, this);
            this.update_value(this.model.get('widgets')[0]);
            // TODO: register for any destruction handlers
        },
        update_value: function(trigger) {
            if (this.updating) {return;}
            var model = trigger[0];
            var attr = trigger[1];
            var new_value = model.get(attr);
            this.updating = true;
            _.each(_.without(this.model.get('widgets'), trigger), function(element, index, list) {
                element[0].set(element[1], new_value);
                element[0].save_changes();
            }, this);
            this.updating = false;
        },
        update: function() {
            // todo: handle changes to the list of objects
        }
    });
    IPython.WidgetManager.register_widget_view('LinkView', LinkView);
