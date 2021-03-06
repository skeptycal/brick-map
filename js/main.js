require([
    "app_modules/initApp"
], function (Application) {

    $(document).ready(function () {

        'use strict';

        var onWindowResizeEndHandler;

        var windowWidth = $(window).width();

        // resizeMapWrapper(true);

        var app = new Application();

        var captureCurrentMapFrame = function(){

            html2canvas($(mapDiv), {
                useCORS: true,
                onrendered: function(canvas) {
                    $("#canvasDiv").empty();
                    processCapturedImage(canvas);
                    // console.log(canvas.toDataURL());
                }
            });
        };

        var processCapturedImage = function(canvas){

            var canvasDivWidth = $("#mapDiv").width();
            var canvasDivHeight = $("#mapDiv").height();

            var tileSize = optimizeTileSize(canvasDivWidth, canvasDivHeight);

            var photomosaic = new PhotoMosaic({
                canvas: canvas,
                targetElement: document.getElementById('canvasDiv'),
                width: canvasDivWidth,
                height: canvasDivHeight,
                tileHeight: tileSize,
                tileWidth: tileSize,
                tileShape: 'rectangle',
            });

            Caman('#processedCanvas', function () {
                var adjustmentValues = getCanvasAdjustmentValues();
                this.brightness(adjustmentValues[0]);
                this.contrast(adjustmentValues[1]);
                this.saturation(adjustmentValues[2]);
                this.render(function(){
                    // do something if you'd like 
                    $("div.canvas-buttons").show();
                    $("div.canvas-wrapper").show();
                });
            });


        };

        var getCanvasAdjustmentValues = function(){

            var currentBaseMap = $(".toggle-basemap-btn.active").text();

            var brightness;
            var contrast;
            var saturation;

            if(currentBaseMap === "Map"){
                brightness = -5;
                contrast = 0;
                saturation = 100;
            } else {
                brightness = 25;
                contrast = 30;
                saturation = 80;
            }

            return [brightness, contrast, saturation];
        };

        function optimizeTileSize(containerWidth, containerHeight){
            var tileSize = 30;

            if(containerWidth < 499){
                tileSize = 20;

                var foo = containerWidth / tileSize;
                var bar = containerHeight /tileSize;

                console.log(foo, bar);
            }

            console.log(containerWidth, containerHeight, tileSize);

            return tileSize;
        }

        function getAdjustedWidth(target){
            var curWidth = parseInt($(target).width());
            var newWidth = Math.floor(curWidth/30) * 30;
            return newWidth;
        };

        function resizeMapWrapper(isFirstAdjustment){

            var newWindowWidth = $(window).width();

            isFirstAdjustment = isFirstAdjustment | false;

            if(newWindowWidth === windowWidth && !isFirstAdjustment) {
                // console.log("same window size, stop adjusting canvas size");
                return;
            } else {
                
                $("#canvasDiv").empty();

                $(".map-wrapper > .top-wrapper").each(function() {

                    var mapWrapper = $(this);

                    mapWrapper.css("width", "100%");
                    mapWrapper.css("height", "100%");
                    mapWrapper.css("left", "0");
                    mapWrapper.css("top", "0");

                    var curWidth = parseInt(mapWrapper.width());
                    var newWidth = Math.floor(curWidth/30) * 30;
                    mapWrapper.width(getAdjustedWidth(mapWrapper));

                    mapWrapper.siblings("div").css("width", newWidth);
                });

                if(!isFirstAdjustment){
                    clearTimeout(onWindowResizeEndHandler);
                    onWindowResizeEndHandler = setTimeout(function(){
                        captureCurrentMapFrame();
                    }, 1000);
                }
            }
        };



        // var drawMapGrid = function(){
        //     //grid width and height
        //     var bw = $("#mapDiv").width();
        //     var bh = $("#mapDiv").height();

        //     //padding around grid
        //     var p = 0;

        //     //size of canvas
        //     var cw = bw + (p*2) + 1;
        //     var ch = bh + (p*2) + 1;

        //     var canvas = $('<canvas/>').attr({width: cw, height: ch}).appendTo('#mapDiv');

        //     var context = canvas.get(0).getContext("2d");

        //     for (var x = 0; x <= bw; x += 30) {
        //         context.moveTo(0.5 + x + p, p);
        //         context.lineTo(0.5 + x + p, bh + p);
        //     }


        //     for (var x = 0; x <= bh; x += 30) {
        //         context.moveTo(p, 0.5 + x + p);
        //         context.lineTo(bw + p, 0.5 + x + p);
        //     }

        //     context.strokeStyle = "#909090";
        //     context.stroke();
        // };

        $(window).resize(resizeMapWrapper);

        $(".change-map-size-icon").on("click", function(){
            $("#canvasDiv").empty();
            $(".change-map-size-icon").removeClass("active");
            $("div.canvas-buttons").hide();
        })

        $("#sqrMapBtn").on("click", function(){

            var newWidth = getAdjustedWidth($(".top-wrapper"));
            
            $(".top-wrapper").css("width", "100%");
            $(".top-wrapper").css("width", getAdjustedWidth($(".top-wrapper")));
            $(".top-wrapper").css("left", "0");
            

            $(".top-wrapper").css("height", "100%");
            $(".top-wrapper").css("top", "0");

            $(".attribute-wrapper").css("width", getAdjustedWidth($(".top-wrapper")));
            $(".attribute-wrapper").css("bottom", "10%");
            $(".attribute-wrapper").css("left", "0");

            $(this).addClass("active");
        });

        $("#hRectMapBtn").on("click", function(){

            var newWidth = getAdjustedWidth($(".top-wrapper"));

            $(".top-wrapper").css("width", "100%");
            $(".top-wrapper").css("width", getAdjustedWidth($(".top-wrapper")));
            $(".top-wrapper").css("left", "0");

            $(".top-wrapper").css("height", "60%");
            $(".top-wrapper").css("top", "15%");

            $(".attribute-wrapper").css("width", getAdjustedWidth($(".top-wrapper")));
            $(".attribute-wrapper").css("bottom", "25%");
            $(".attribute-wrapper").css("left", "0");

            $(this).addClass("active");
        });

        $("#vRectMapBtn").on("click", function(){

            $(".top-wrapper").css("height", "100%");
            $(".top-wrapper").css("top", "0");

            $(".top-wrapper").css("width", "60%");
            $(".top-wrapper").css("left", "20%");

            $(".attribute-wrapper").css("bottom", "10%");
            $(".attribute-wrapper").css("width", "60%");
            $(".attribute-wrapper").css("left", "20%");

            $(this).addClass("active");
        });

        $(".convert-btn").on("click", captureCurrentMapFrame);

        $(".toggle-basemap-btn").on("click", function(evt){

            var currentBaseMap = $(this).text();

            var oceanLayer = app.map.getLayer("ocean_without_labels");

            if(currentBaseMap !== "Map") {
                // app.map.setBasemap("satellite");

                oceanLayer.setVisibility(false);

                $(".attribute-wrapper").html('<span>Basemaps powered by <a target="_blank" href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9">Esri World Imagery</a> Map Tiles.</span>');

            } else {
                // app.map.setBasemap("oceans");

                oceanLayer.setVisibility(true);

                $(".attribute-wrapper").html('<span>Basemaps powered by <a target="_blank" href="https://www.arcgis.com/home/item.html?id=1e126e7520f9466c9ca28b8f28b5e500">Esri World Ocean Base</a> Map Tiles.</span>');
            }

            $(".toggle-basemap-btn").removeClass("active");
            $(this).addClass("active");
        });

        $(".download-canvas-image").on('click', function(evt) {
            var canvas = document.getElementById('processedCanvas');
            var dataUrl = canvas.toDataURL();
            var link = document.createElement('a');

            link.download = 'Legoifer.jpeg';
            link.href = dataUrl;
            link.click();
        });

        $('.twitter-popup').on('click', function(event) {
            var message = 'LEGO-IFY the world in this bricky app.';
            var width  = 500,
                height = 300,
                left   = ($(window).width()  - width)  / 2,
                top    = ($(window).height() - height) / 2,
                url    = 'http://twitter.com/intent/tweet?hashtags=Legoifer&text=' + message + '&url=' + encodeURIComponent(window.location.href),
                opts   = 'status=1' +
                        ',width='  + width  +
                        ',height=' + height +
                        ',top='    + top    +
                        ',left='   + left;
            
            window.open(url, 'twitter', opts);
        
            return false;
        }); 

        $('.facebook-popup').on('click', function(event) {
            FB.ui({
                method: 'share',
                display: 'popup',
                quote: 'LEGO-IFY the world in this bricky app.',
                href: window.location.href,
            }, function(response){});
        
            return false;
        }); 

        document.ontouchmove = function(event){
            event.preventDefault();
        }

    });
});