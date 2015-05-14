(function($){
 	
 	var calderaBackdrop = null,
 		calderaModals 	= {},
 		activeModals 	= [],
		pageHTML		= $('html'),
		pageBody		= $('body'),
 		mainWindow 		= $(window);

	var positionModals = function(){

		if( !activeModals.length ){
			return;
		}
		pageHTML.addClass('has-caldera-modal');

		var modalId	 = activeModals[ ( activeModals.length - 1 ) ],
			windowWidth  = mainWindow.width(),
			windowHeight = mainWindow.height(),
			modalHeight  = calderaModals[ modalId ].config.height,
			modalOuterHeight  = modalHeight,
			modalWidth  = calderaModals[ modalId ].config.width,
			top 		 = 0,
			flickerBD	 = false,
			modalReduced = false;

		// top
		top = (windowHeight - calderaModals[ modalId ].config.height ) / 2.2;

		if( top < 0 ){
			top = 0;
		}
		if( modalHeight + ( calderaModals[ modalId ].config.padding * 2 ) > windowHeight ){
			modalHeight = windowHeight - ( calderaModals[ modalId ].config.padding * 2 );
			modalOuterHeight = '100%';
			calderaBackdrop.css( {
				paddingTop: calderaModals[ modalId ].config.padding,
				paddingBottom: calderaModals[ modalId ].config.padding,
			});
			modalReduced = true;
		}
		if( modalWidth + ( calderaModals[ modalId ].config.padding * 2 ) >= windowWidth ){
			modalWidth = '100%';
			calderaBackdrop.css( {
				paddingLeft: calderaModals[ modalId ].config.padding,
				paddingRight: calderaModals[ modalId ].config.padding,
			});
			modalReduced = true;
		}

		if( true === modalReduced ){
			if( windowWidth <= 700 && windowWidth > 600 ){
				modalHeight = windowHeight - ( calderaModals[ modalId ].config.padding * 2 );
				modalWidth = windowWidth;
				modalOuterHeight = modalHeight - ( calderaModals[ modalId ].config.padding * 2 );
				modalWidth = '100%';
				top = 0;
				calderaBackdrop.css( { padding : calderaModals[ modalId ].config.padding } );
			}else if( windowWidth <= 600 ){
				modalHeight = windowHeight;
				modalWidth = windowWidth;
				modalOuterHeight = '100%';
				top = 0;
				calderaBackdrop.css( { padding : 0 } );
			}
		}


		// set backdrop
		if( calderaBackdrop.is(':hidden') ){
			flickerBD = true;
			calderaBackdrop.show();
		}
		// title?
		if( calderaModals[ modalId ].header ){
			calderaBackdrop.show();
			modalHeight -= calderaModals[ modalId ].header.outerHeight();
			calderaModals[ modalId ].closer.css( { 
				padding		: ( calderaModals[ modalId ].header.outerHeight() / 2 ) - 0.5
			} );
			calderaModals[ modalId ].title.css({ paddingRight: calderaModals[ modalId ].closer.outerWidth() } );
		}
		// footer?
		if( calderaModals[ modalId ].footer ){
			calderaBackdrop.show();
			modalHeight -= calderaModals[ modalId ].footer.outerHeight();			
		}

		if( flickerBD === true ){
			calderaBackdrop.hide();
			flickerBD = false;
		}



		// set final height
		if( modalHeight != modalOuterHeight ){
			calderaModals[ modalId ].body.css( { 
				height		: modalHeight			
			} );
		}
		calderaModals[ modalId ].modal.css( {
			marginTop 	: top,
			width		: modalWidth,
			height		: modalOuterHeight
		} );


		calderaBackdrop.fadeIn( calderaModals[ modalId ].config.speed );
		return calderaModals; 
	}

	var closeModal = function(){
		var lastModal;
		if( activeModals.length ){
			
			lastModal = activeModals.pop();

			calderaModals[ lastModal ].modal.hide( 0 , function(){
				$( this ).remove();
				delete calderaModals[ lastModal ];
			});

		}

		if( !activeModals.length ){
			calderaBackdrop.fadeOut( 250 , function(){
				$( this ).remove();
				calderaBackdrop = null;
			});
			pageHTML.removeClass('has-caldera-modal');
		}else{			
			calderaModals[ activeModals[ ( activeModals.length - 1 ) ] ].modal.show();
		}

	}

	$.fn.calderaModal = function(opts){
		var defaults    = $.extend(true, {
			height				:	550,
			width				:	620,
			padding				:	12,
			speed				:	250
		}, opts ),
		trigger 	= $( this );



		if( !calderaBackdrop ){
			calderaBackdrop = $('<div>', {"class" : "caldera-backdrop"});
			calderaBackdrop.on('click', function( e ){
				if( e.target == this ){
					closeModal();
				}
			});
			pageBody.append( calderaBackdrop );
			calderaBackdrop.hide();
		}



		// create modal element
		var modalElement = trigger.data('element') ? trigger.data('element') : 'div',
			modalId = trigger.data('modal');

		if( activeModals.length ){

			if( activeModals[ ( activeModals.length - 1 ) ] !== modalId ){
				calderaModals[ activeModals[ ( activeModals.length - 1 ) ] ].modal.hide();
			}
		}

		if( typeof calderaModals[ modalId ] === 'undefined' ){
			
			calderaModals[ modalId ] = {
				config	:	defaults,
				modal	:	$('<' + modalElement + '>', {
					id					: modalId + '_calderaModal',
					tabIndex			: -1,
					"ariaLabelled-by"	: modalId + '_calderaModalLable',
					"class"				: "caldera-modal-wrap"
				})
			};
			activeModals.push( modalId );
		}else{
			calderaModals[ modalId ].config = defaults;
			calderaModals[ modalId ].modal.empty();
		}

		calderaModals[ modalId ].body = $('<div>', {"class" : "caldera-modal-body",id: modalId + '_calderaModalBody'});
		calderaModals[ modalId ].content = $('<div>', {"class" : "caldera-modal-content",id: modalId + '_calderaModalContent'});
			
		if( defaults.title ){
			
			calderaModals[ modalId ].header = $('<div>', {"class" : "caldera-modal-title", id : modalId + '_calderaModalTitle'});
			calderaModals[ modalId ].closer = $('<a>', { "href" : "#close", "class":"caldera-modal-closer", "data-dismiss":"modal", "aria-hidden":"true",id: modalId + '_calderaModalCloser'}).html('&times;');
			calderaModals[ modalId ].title = $('<h3>', {"class" : "modal-label", id : modalId + '_calderaModalLable'});

			calderaModals[ modalId ].closer.appendTo( calderaModals[ modalId ].header ).on('click', function(){
				calderaBackdrop.trigger( 'click' );
			});
			calderaModals[ modalId ].title.html( defaults.title ).appendTo( calderaModals[ modalId ].header );
			calderaModals[ modalId ].title.css({ padding: defaults.padding });
			calderaModals[ modalId ].header.appendTo( calderaModals[ modalId ].modal );
		}

		// padd content		
		calderaModals[ modalId ].content.css( { 
			margin : defaults.padding
		} );
		calderaModals[ modalId ].body.append( calderaModals[ modalId ].content ).appendTo( calderaModals[ modalId ].modal );
		calderaBackdrop.append( calderaModals[ modalId ].modal );


		if( defaults.footer ){
			calderaModals[ modalId ].footer = $('<div>', {"class" : "caldera-modal-footer",id: modalId + '_calderaModalFooter'});
			calderaModals[ modalId ].footer.css({ padding: defaults.padding });
			calderaModals[ modalId ].footer.appendTo( calderaModals[ modalId ].modal );
			// function?
			if( typeof window[defaults.footer] === 'function' ){
				calderaModals[ modalId ].footer.append( window[defaults.footer]( opts, this ) );
			}else if( typeof defaults.footer === 'string' ){
				// is jquery selector?
				  try {
				  	var footerElement = $( defaults.footer );
				  	calderaModals[ modalId ].footer.html( footerElement.html() );
				  } catch (err) {
				  	calderaModals[ modalId ].footer.html( defaults.footer );
				  }
			}
		}

		// hide modal
		calderaModals[ modalId ].modal.outerHeight( defaults.height );
		calderaModals[ modalId ].modal.outerWidth( defaults.width );

		if( defaults.content ){
			// function?
			if( typeof window[defaults.content] === 'function' ){
				calderaModals[ modalId ].content.append( window[defaults.content]( opts, this ) );
			}else if( typeof defaults.content === 'string' ){
				// is jquery selector?
				  try {
				  	var contentElement = $( defaults.content );
				  	if( contentElement.length ){
				  		calderaModals[ modalId ].content.html( contentElement.html() );
				  	}else{
				  		calderaModals[ modalId ].content.html( defaults.content );
				  	}
				  } catch (err) {
				  	calderaModals[ modalId ].content.html( defaults.content );
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
        	if( e.keyCode === 27 && calderaBackdrop !== null ){
        		calderaBackdrop.trigger('click');
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

		clicked.calderaModal( clicked.data() );

	});



})(jQuery);
