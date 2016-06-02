(function($){
 	
 	var calmodalBackdrop = null,
 		calmodalModals 	= {},
 		activeModals 	= [],
		pageHTML		= $('html'),
		pageBody		= $('body'),
 		mainWindow 		= $(window);

	var positionModals = function(){

		if( !activeModals.length ){
			return;
		}
		pageHTML.addClass('has-calmodal-modal');

		var modalId	 = activeModals[ ( activeModals.length - 1 ) ],
			windowWidth  = mainWindow.width(),
			windowHeight = mainWindow.height(),
			modalHeight  = calmodalModals[ modalId ].config.height,
			modalOuterHeight  = modalHeight,
			modalWidth  = calmodalModals[ modalId ].config.width,
			top 		 = 0,
			flickerBD	 = false,
			modalReduced = false;

		// top
		top = (windowHeight - calmodalModals[ modalId ].config.height ) / 2.2;

		if( top < 0 ){
			top = 0;
		}
		if( modalHeight + ( calmodalModals[ modalId ].config.padding * 2 ) > windowHeight ){
			modalHeight = windowHeight - ( calmodalModals[ modalId ].config.padding * 2 );
			modalOuterHeight = '100%';
			calmodalBackdrop.css( {
				paddingTop: calmodalModals[ modalId ].config.padding,
				paddingBottom: calmodalModals[ modalId ].config.padding,
			});
			modalReduced = true;
		}
		if( modalWidth + ( calmodalModals[ modalId ].config.padding * 2 ) >= windowWidth ){
			modalWidth = '100%';
			calmodalBackdrop.css( {
				paddingLeft: calmodalModals[ modalId ].config.padding,
				paddingRight: calmodalModals[ modalId ].config.padding,
			});
			modalReduced = true;
		}

		if( true === modalReduced ){
			if( windowWidth <= 700 && windowWidth > 600 ){
				modalHeight = windowHeight - ( calmodalModals[ modalId ].config.padding * 2 );
				modalWidth = windowWidth;
				modalOuterHeight = modalHeight - ( calmodalModals[ modalId ].config.padding * 2 );
				modalWidth = '100%';
				top = 0;
				calmodalBackdrop.css( { padding : calmodalModals[ modalId ].config.padding } );
			}else if( windowWidth <= 600 ){
				modalHeight = windowHeight;
				modalWidth = windowWidth;
				modalOuterHeight = '100%';
				top = 0;
				calmodalBackdrop.css( { padding : 0 } );
			}
		}


		// set backdrop
		if( calmodalBackdrop.is(':hidden') ){
			flickerBD = true;
			calmodalBackdrop.show();
		}
		// title?
		if( calmodalModals[ modalId ].header ){
			calmodalBackdrop.show();
			modalHeight -= calmodalModals[ modalId ].header.outerHeight();
			calmodalModals[ modalId ].closer.css( { 
				padding		: ( calmodalModals[ modalId ].header.outerHeight() / 2 ) - 0.5
			} );
			calmodalModals[ modalId ].title.css({ paddingRight: calmodalModals[ modalId ].closer.outerWidth() } );
		}
		// footer?
		if( calmodalModals[ modalId ].footer ){
			calmodalBackdrop.show();
			modalHeight -= calmodalModals[ modalId ].footer.outerHeight();			
		}

		if( flickerBD === true ){
			calmodalBackdrop.hide();
			flickerBD = false;
		}



		// set final height
		if( modalHeight != modalOuterHeight ){
			calmodalModals[ modalId ].body.css( { 
				height		: modalHeight			
			} );
		}
		calmodalModals[ modalId ].modal.css( {
			marginTop 	: top,
			width		: modalWidth,
			height		: modalOuterHeight
		} );


		calmodalBackdrop.fadeIn( calmodalModals[ modalId ].config.speed );
		return calmodalModals; 
	}

	var closeModal = function(){
		var lastModal;
		if( activeModals.length ){
			
			lastModal = activeModals.pop();

			calmodalModals[ lastModal ].modal.hide( 0 , function(){
				$( this ).remove();
				delete calmodalModals[ lastModal ];
			});

		}

		if( !activeModals.length ){
			calmodalBackdrop.fadeOut( 250 , function(){
				$( this ).remove();
				calmodalBackdrop = null;
			});
			pageHTML.removeClass('has-calmodal-modal');
		}else{			
			calmodalModals[ activeModals[ ( activeModals.length - 1 ) ] ].modal.show();
		}

	}

	$.fn.calmodalModal = function(opts){
		var defaults    = $.extend(true, {
			height				:	550,
			width				:	620,
			padding				:	12,
			speed				:	250
		}, opts ),
		trigger 	= $( this );



		if( !calmodalBackdrop ){
			calmodalBackdrop = $('<div>', {"class" : "calmodal-backdrop"});
			calmodalBackdrop.on('click', function( e ){
				if( e.target == this ){
					closeModal();
				}
			});
			pageBody.append( calmodalBackdrop );
			calmodalBackdrop.hide();
		}



		// create modal element
		var modalElement = trigger.data('element') ? trigger.data('element') : 'div',
			modalId = trigger.data('modal');

		if( activeModals.length ){

			if( activeModals[ ( activeModals.length - 1 ) ] !== modalId ){
				calmodalModals[ activeModals[ ( activeModals.length - 1 ) ] ].modal.hide();
			}
		}

		if( typeof calmodalModals[ modalId ] === 'undefined' ){
			
			calmodalModals[ modalId ] = {
				config	:	defaults,
				modal	:	$('<' + modalElement + '>', {
					id					: modalId + '_calmodalModal',
					tabIndex			: -1,
					"ariaLabelled-by"	: modalId + '_calmodalModalLable',
					"class"				: "calmodal-modal-wrap"
				})
			};
			activeModals.push( modalId );
		}else{
			calmodalModals[ modalId ].config = defaults;
			calmodalModals[ modalId ].modal.empty();
		}

		calmodalModals[ modalId ].body = $('<div>', {"class" : "calmodal-modal-body",id: modalId + '_calmodalModalBody'});
		calmodalModals[ modalId ].content = $('<div>', {"class" : "calmodal-modal-content",id: modalId + '_calmodalModalContent'});
			
		if( defaults.title ){
			
			calmodalModals[ modalId ].header = $('<div>', {"class" : "calmodal-modal-title", id : modalId + '_calmodalModalTitle'});
			calmodalModals[ modalId ].closer = $('<a>', { "href" : "#close", "class":"calmodal-modal-closer", "data-dismiss":"modal", "aria-hidden":"true",id: modalId + '_calmodalModalCloser'}).html('&times;');
			calmodalModals[ modalId ].title = $('<h3>', {"class" : "modal-label", id : modalId + '_calmodalModalLable'});

			calmodalModals[ modalId ].closer.appendTo( calmodalModals[ modalId ].header ).on('click', function(){
				calmodalBackdrop.trigger( 'click' );
			});
			calmodalModals[ modalId ].title.html( defaults.title ).appendTo( calmodalModals[ modalId ].header );
			calmodalModals[ modalId ].title.css({ padding: defaults.padding });
			calmodalModals[ modalId ].header.appendTo( calmodalModals[ modalId ].modal );
		}

		// padd content		
		calmodalModals[ modalId ].content.css( { 
			margin : defaults.padding
		} );
		calmodalModals[ modalId ].body.append( calmodalModals[ modalId ].content ).appendTo( calmodalModals[ modalId ].modal );
		calmodalBackdrop.append( calmodalModals[ modalId ].modal );


		if( defaults.footer ){
			calmodalModals[ modalId ].footer = $('<div>', {"class" : "calmodal-modal-footer",id: modalId + '_calmodalModalFooter'});
			calmodalModals[ modalId ].footer.css({ padding: defaults.padding });
			calmodalModals[ modalId ].footer.appendTo( calmodalModals[ modalId ].modal );
			// function?
			if( typeof window[defaults.footer] === 'function' ){
				calmodalModals[ modalId ].footer.append( window[defaults.footer]( opts, this ) );
			}else if( typeof defaults.footer === 'string' ){
				// is jquery selector?
				  try {
				  	var footerElement = $( defaults.footer );
				  	calmodalModals[ modalId ].footer.html( footerElement.html() );
				  } catch (err) {
				  	calmodalModals[ modalId ].footer.html( defaults.footer );
				  }
			}
		}

		// hide modal
		calmodalModals[ modalId ].modal.outerHeight( defaults.height );
		calmodalModals[ modalId ].modal.outerWidth( defaults.width );

		if( defaults.content ){
			// function?
			if( typeof window[defaults.content] === 'function' ){
				calmodalModals[ modalId ].content.append( window[defaults.content]( opts, this ) );
			}else if( typeof defaults.content === 'string' ){
				// is jquery selector?
				  try {
				  	var contentElement = $( defaults.content );
				  	if( contentElement.length ){
				  		calmodalModals[ modalId ].content.html( contentElement.html() );
				  	}else{
				  		calmodalModals[ modalId ].content.html( defaults.content );
				  	}
				  } catch (err) {
				  	calmodalModals[ modalId ].content.html( defaults.content );
				  }
			}
		}

		// set position;
		positionModals();
		// return main object
		return this;
	}

	// setup resize positioning and keypresses
    if ( window.addEventListener ) {
        window.addEventListener( "resize", positionModals, false );
        window.addEventListener( "keypress", function(e){
        	if( e.keyCode === 27 && calmodalBackdrop !== null ){
        		calmodalBackdrop.trigger('click');
        	}
        }, false );

    } else if ( window.attachEvent ) {
        window.attachEvent( "onresize", positionModals );
    } else {
        window["onresize"] = positionModals;
    }



	$(document).on('click', '[data-modal]', function( e ){
		
		e.preventDefault();
		var clicked = $(this);

		clicked.calmodalModal( clicked.data() );

	});



})(jQuery);
