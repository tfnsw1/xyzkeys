try{
   
   var trivActualSetTimeout = window.setTimeout;
   var trivActualSetInterval = window.setInterval;
   var trivTimeoutIds = {};
   var trivIntervalIds = {};
   window.setTimeout = function( callback, time ) {
       
       if( typeof(callback) != 'function' && typeof(callback) != 'string' )
               trivActualSetTimeout.apply(this, arguments );//abort
           
       var params = [];
       if( arguments.length > 2 ) 
           params = arguments.slice( 2, arguments.length-1 );
       var timeoutId = null;
       var trivCallBack = function( ){
           delete trivTimeoutIds[ timeoutId+"" ];
           if( typeof(callback) == 'function' ) 
           {
               callback.apply( this, params );
           }
           else if( typeof(callback) == 'string' )
           {
               eval( callback );
           }
       };
       timeoutId = trivActualSetTimeout( trivCallBack, time );
       trivTimeoutIds[ timeoutId+"" ] = timeoutId;
       return  timeoutId;       
   };
   
   window.setInterval = function(callback, time){
	   if( typeof(callback) != 'function' && typeof(callback) != 'string' )
               return trivActualSetInterval.apply(this, arguments );//abort
           
       var params = [];
       if( arguments.length > 2 ) 
           params = arguments.slice( 2, arguments.length-1 );
       var timeoutId = null;
       var trivCallBack = function( ){
           if( typeof(callback) == 'function' ) 
           {
               callback.apply( this, params );
           }
           else if( typeof(callback) == 'string' )
           {
               eval( callback );
           }
       };
       timeoutId = trivActualSetInterval( trivCallBack, time );
       trivIntervalIds[ timeoutId+"" ] = timeoutId;
	   
       return timeoutId;        
   };
   
   window.clearAllTimeouts = function(){
       for (var timeoutId in trivTimeoutIds) {
           if (trivTimeoutIds.hasOwnProperty(timeoutId)) {
               delete trivTimeoutIds[ timeoutId+"" ];
               window.clearTimeout( timeoutId );
           }
       }
   };
   
    window.clearAllIntervals = function(){
       for (var timeoutId in trivIntervalIds) {
           if (trivIntervalIds.hasOwnProperty(timeoutId)) {
               delete trivIntervalIds[ timeoutId+"" ];
               window.clearInterval( timeoutId );
           }
       }
   };
}    
catch(e){
   
}


function jsOpaUtils()
{

}

jsOpaUtils.createMediaElemPlayer = function (htmlVideoElem, options, jsObj)
{
	var mediaPlayerObj = null;
	if(jsObj.iType && jsObj.iType =='youtube')
	{
		mediaPlayerObj = new YT.Player('html5'+jsObj.name, 
		{
			height: jsObj.h,
			width: jsObj.w,
			videoId: jsObj.vID,
			playerVars: jsObj.ytVar,
			events: { 'onStateChange': jsObj.stateChange}		
		});
	}
	return mediaPlayerObj;
};

//Might have other functionality in the future
jsOpaUtils.setUpPage = function (pageObj, bRebuild)
{
	if(pageObj)
	{
		pageObj.iframe.contentWindow.SetPageDivID(pageObj.div.id);
		if(bRebuild)
		{
			if(pageObj.iframe.contentWindow["loadVariables"])
				pageObj.iframe.contentWindow["loadVariables"]();
			
			if(pageObj.iframe.contentWindow["loadActions"])
				pageObj.iframe.contentWindow["loadActions"]();
			
			if(pageObj.iframe.contentWindow["UpdateIndicators"])
				pageObj.iframe.contentWindow["UpdateIndicators"]();
		}
		pageObj.iframe.contentWindow.RebuildPageLayerObj(bRebuild);
		
		pagePlayer.updatePlayerDIVs(pageObj.div, pageObj.iframe.contentWindow["pageLayer"]);
	}
};

jsOpaUtils.setupPreloadedPage = function (pageObj)
{
	if(pageObj)
	{
		if(pageObj.iframe.contentWindow.location.href.indexOf(pageObj.name)>-1 && pageObj.iframe.contentDocument.readyState == 'complete')
		{
			jsOpaUtils.setUpPage(pageObj, false);
			window.removeEventListener("resize", pageObj.iframe.contentWindow.changeSize);
			jsOpaUtils.stopMedia(pageObj);
		}
		else
		{
			var THIS = this;
			setTimeout( function(){THIS.setupPreloadedPage(pageObj);}, 100);
		}
	}
};

jsOpaUtils.completeRCDLoad = function (pageObj)
{
	if(pageObj)
	{
		if(pageObj.iframe.contentWindow.bTrivResponsive)
		{
			pageObj.iframe.contentWindow.SaveStyles(pageObj);
			if(is.iOS)
			{
				window.addEventListener("orientationchange", pageObj.iframe.contentWindow.changeSize);
				window.addEventListener("resize", pageObj.iframe.contentWindow.barHidden);
			}
			else
				window.addEventListener("resize", pageObj.iframe.contentWindow.changeSize);
		}
	}
};

jsOpaUtils.removeRCDListener = function (prevPage)
{
	if(prevPage)
	{
			if(prevPage.iframe.contentWindow.bTrivResponsive)
			{
				if(is.iOS)
				{
					window.removeEventListener("orientationchange", prevPage.iframe.contentWindow.changeSize);
					window.removeEventListener("resize", prevPage.iframe.contentWindow.barHidden);
				}
				else
					window.removeEventListener("resize", prevPage.iframe.contentWindow.changeSize);
			}
	}
};

jsOpaUtils.resolveRCDSetup = function (currPage, prevPage)
{
	if(currPage)
	{
		if(currPage == prevPage)
		{
			setTimeout( function(){jsOpaUtils.resolveRCDSetup(pagePlayer.activePage, prevPage);}, 100);
		}
		else
		{
			if(currPage.iframe.contentWindow.bTrivResponsive)
			{
				window.removeEventListener("resize", prevPage.iframe.contentWindow.changeSize);
				window.addEventListener("resize", currPage.iframe.contentWindow.changeSize);
			}
		}
	}
};

jsOpaUtils.stopMedia = function (pageObj)
{
	if(pageObj)
	{
		var tmpAr = pageObj.iframe.contentWindow.arObjs;
		for (var index = 0; index < tmpAr.length; index++)
		{
			//Check if the objects exist
			if(tmpAr[index].objLyr)
			{
				if(!tmpAr[index].bInherited && tmpAr[index].timerVar == null)
					tmpAr[index].actionStop();
			}
			else
			{
				setTimeout(function(){jsOpaUtils.stopMedia(pageObj);}, 150);
				return;
			}
		}
	}
};

//Remove Listeners for objects that are going away, currently only doing for media
jsOpaUtils.removeListeners = function (pageObj)
{
	if(pageObj)
	{
		var tmpAr = pageObj.iframe.contentWindow.arObjs;
		for (var index = 0; index < tmpAr.length; index++)
		{
			//Check if the objects exist
			if(tmpAr[index].objLyr)
			{
				//If it is a media object then remove the event listeners
				if(typeof(pageObj.iframe.contentWindow["ObjMedia"]) != 'undefined' && tmpAr[index].constructor == pageObj.iframe.contentWindow["ObjMedia"])
				{
					//If mediaEle remove all listeners
					if(tmpAr[index].bMediaEle)
						tmpAr[index].removeAllMediaListeners();
				}
				
			}
		}
	}
};

jsOpaUtils.doTransition = function (objLayer, out, tData)
{
	var transD = null;
	if(typeof(tData) != "undefined")
		transD = tData;
	else
		transD = objLayer.transData;
	
	//LD-4647 --These two transitions are a special case.
	if((transD.tNum == 16 || transD.tNum == 14) && out)
	{
		objLayer.doTrans(out?1:transD.tOut,
						 34, 5,
						 null, transD.ol,
						 transD.ot, transD.fl,
						 transD.ft, transD.fr,
						 transD.fb, transD.il,
						 transD.eff, transD.tb);
	}
	else
	{
		objLayer.doTrans(out?1:transD.tOut,
						 transD.tNum, transD.dur,
						 transD.fn, transD.ol,
						 transD.ot, transD.fl,
						 transD.ft, transD.fr,
						 transD.fb, transD.il,
						 transD.eff, transD.tb);
	}
};

jsOpaUtils.createInitClickDiv = function (trivpage)
{
	//This is for AUTOSTART media. We need to get a single click to be able to
	//autostart media. This will force the user to click the screen.
	if (trivpage.iframe.contentWindow.bPageLoaded)
	{
		var arObj = trivpage.iframe.contentWindow.arObjs;
		var bAutoStart = (typeof(bHasAutoStart) != "undefined")?bHasAutoStart:false;
		var bHasVideo = false;
		var bHasAudio = false;
		for(var index = 0; index < arObj.length; index++)
		{
			if(typeof(arObj[index].bAutoStart) != "undefined")
			{
				if(arObj[index].bAutoStart)
				{
					bAutoStart = true;
					if(typeof(trivpage.iframe.contentWindow["ObjMedia"]) != 'undefined' && arObj[index].constructor == trivpage.iframe.contentWindow["ObjMedia"])
					{
						if(arObj[index].isAudio())
							bHasAudio = true;
						
						if(arObj[index].isVideo())
							bHasVideo = true;
					}
				}
			}
		}
		if(trivpage.iframe.contentWindow[trivpage.bkAudio])
			bAutoStart = true;
		
		if(bAutoStart)
		{
			var nDiv = document.createElement('div');
				nDiv.setAttribute('id', "initClickDiv");
				nDiv.style.position = 'absolute';
				nDiv.style.backgroundColor = 'rgb(77, 77, 77)';
				nDiv.style.opacity = '.9';
				nDiv.style.width = '100%';
				nDiv.style.height = '100%';
				nDiv.style.top = '0px';
				nDiv.style.left = '0px';
				nDiv.style.zIndex = 999999;
				nDiv.onclick = function(){
					//LD-4611
					if(!bHasAudio && pagePlayer.autoAudioObj)
					{
						pagePlayer.autoAudioObj.actionPlay();
						pagePlayer.autoAudioObj.actionStop();
					}
					//LD-4611
					if(!bHasVideo && pagePlayer.autoVideoObj)
					{
						pagePlayer.autoVideoObj.actionPlay();
						pagePlayer.autoVideoObj.actionStop();
						pagePlayer.autoVideoObj.div.style.display ='';
					}
					
					//LD-4908 - Need to start bkaudio when not present on first page
					if(pagePlayer.bkAudioObj)
					{
						pagePlayer.bkAudioObj.actionPlay();
						pagePlayer.bkAudioObj.actionStop();
					}
					
					pagePlayer.bFirstClickGrabbed = true;
					nDiv.style.visibility = "hidden";
					document.getElementById(trivpage.div.id).display = "block"; 
					jsOpaUtils.playAutoStartMedia(trivpage);
					trivpage.div.removeChild(nDiv);
				};
			var clickText = document.createTextNode(trivstrAUTO);
			var pTag = document.createElement('span');
				pTag.style.color = 'white';
				pTag.style.position = 'absolute';
				pTag.style.textAlign = 'center';
				pTag.style.top = '50%';
				pTag.style.right = '50%';
				pTag.style.height = '100px';
				pTag.style.width = '100px';
				pTag.style.margin = 'auto';
				pTag.appendChild(clickText);
			nDiv.appendChild(pTag);
			document.getElementById(trivpage.div.id).appendChild(nDiv);
			document.getElementById(trivpage.div.id).display = "none";
		}
	}
	else
	{
		var THIS = this;
		setTimeout( function(){THIS.createInitClickDiv(trivpage);}, 100);
	}
};

jsOpaUtils.playAutoStartMedia = function(trivpage)
{
	if(!pagePlayer.bFirstClickGrabbed && is.isMobile.any())
	{
		jsOpaUtils.createInitClickDiv(trivpage);
		return;
	}
	
	if(trivpage && trivpage.iframe.contentWindow.bPageLoaded)
	{
		var arObj = trivpage.iframe.contentWindow.arObjs;
		var bVideoSet = false;
		var bAudioSet = false;
		for(var index = 0; index < arObj.length; index++)
		{
			if(typeof(arObj[index].bAutoStart) != "undefined")
			{
				if(arObj[index].bAutoStart)
				{
					if(is.isMobile.any())
					{
						if(typeof(trivpage.iframe.contentWindow["ObjMedia"]) != 'undefined' && arObj[index].constructor == trivpage.iframe.contentWindow["ObjMedia"])
						{
							if(bVideoSet && bAudioSet)
								continue;
							
							arObj[index].actionStop();
							if(arObj[index].isVideo() && !bVideoSet)
							{
								pagePlayer.autoVideoObj.actionChangeContents(arObj[index].getSource());
								pagePlayer.autoVideoObj.sizeTo(arObj[index].w, arObj[index].h);
								pagePlayer.autoVideoObj.div.style.display = '';
								pagePlayer.autoVideoObj.arrEvents = arObj[index].arrEvents;

								arObj[index].rebuildMediaPlayer(pagePlayer.autoVideoObj.mediaElement, pagePlayer.autoVideoObj.mediaPlayer, 'pgAutoVideo');
								bVideoSet = true;
							}
							else if(arObj[index].isAudio() && !bAudioSet)
							{
								pagePlayer.autoAudioObj.actionChangeContents(arObj[index].getSource());
								pagePlayer.autoAudioObj.sizeTo(arObj[index].w, arObj[index].h);
								pagePlayer.autoAudioObj.arrEvents = arObj[index].arrEvents;
								
								arObj[index].rebuildMediaPlayer(pagePlayer.autoAudioObj.mediaElement, pagePlayer.autoAudioObj.mediaPlayer, 'pgAutoAudio');
								bAudioSet = true;
							}
						}
					}
					
					arObj[index].actionPlay();
				}
			}
		}
				
		if(trivpage.iframe.contentWindow[trivpage.bkAudio] && !trivpage.iframe.contentWindow[trivpage.bkAudio].isPlaying)
			pagePlayer.bkAudioObj.actionPlay()
	}
};

jsOpaUtils.createBkAudioPlayer = function(pagePlayer)
{
	
	if(!pagePlayer.bkAudioObj)
	{
		pagePlayer.bkAudioObj =  new ObjMedia('pgBkAudio','audio',0,0,-1,24,0,0,'media/blank.mp4',1,0,0,0,1,0.80,1,'div',0, 'pgBkAudio');
		pagePlayer.bkAudioObj.BuildMediaString();
		pagePlayer.bkAudioObj.build();
		document.body.appendChild(pagePlayer.bkAudioObj.div);
		pagePlayer.bkAudioObj.init();
		pagePlayer.bkAudioObj.activate();
	}
};

jsOpaUtils.createAutoStartMedia = function(pagePlayer){
	if(!pagePlayer.autoAudioObj)
	{
		pagePlayer.autoAudioObj =  new ObjMedia('pgAutoAudio','audio',25,268,300,24,0,10,'media/blank.mp4',0,1,0,0,1,0.80,1,'div', 0, 'pgAutoAudio');
		pagePlayer.autoAudioObj.addCaption('','en');
		pagePlayer.autoAudioObj.BuildMediaString();
		pagePlayer.autoAudioObj.build();
		pagePlayer.autoAudioObj.div.style.pointerEvents = "auto";
		pagePlayer.inheritedDiv.appendChild(pagePlayer.autoAudioObj.div);
		pagePlayer.autoAudioObj.init();
		pagePlayer.autoAudioObj.activate();
	}
	
	if(!pagePlayer.autoVideoObj)
	{
		pagePlayer.autoVideoObj =  new ObjMedia('pgAutoVideo','video',439,172,384,216,0,11,'media/blank.mp4',0,1,0,0,1,0.80,1,'div', 0, 'pgAutoVideo');
		pagePlayer.autoVideoObj.addCaption('','en');
		pagePlayer.autoVideoObj.BuildMediaString();
		pagePlayer.autoVideoObj.build();
		pagePlayer.autoVideoObj.div.style.pointerEvents = "auto";
		//LD-4602
		if(is.iOS)
			pagePlayer.autoVideoObj.div.style.display = 'none';
		pagePlayer.inheritedDiv.appendChild(pagePlayer.autoVideoObj.div);
		pagePlayer.autoVideoObj.init();
		pagePlayer.autoVideoObj.activate();
	}
}

jsOpaUtils.createInheritedDIV = function()
{
	var div = n;
	var trivInhSty = n;
	div = document.getElementById("trivInherited");
	trivInhSty = document.getElementById("trivInheritedStyles");
	if(!div)
	{
		div = document.createElement('div');
		div.id = "trivInherited";
		div.className = "pageDIV"
		div.style.pointerEvents = "none";
		
		document.body.appendChild(div);
	}
	
	/*if(!trivInhSty)
	{
		trivInhSty = document.createElement('style');
		var cssStr = '.trivInherited{pointer-events: auto;}'
		trivInhSty.id = "trivInheritedStyles";
		trivInhSty.type = 'text/css';
		if(trivInhSty.styleSheet)
			trivInhSty.styleSheet.cssText = cssStr;
		else 
			trivInhSty.appendChild(document.createTextNode(cssStr));
		
		var  head = document.head || document.getElementsByTagName('head')[0];
		if(head)
			head.appendChild(trivInhSty);
	}*/
	
	return div;
};

jsOpaUtils.transferBkAudio = function(trivPage)
{
	if(trivPage.iframe.contentWindow[trivPage.bkAudio])
	{
		//If there is no div then we already added it to the player layer so we do nothing
		if(!trivPage.iframe.contentWindow[trivPage.bkAudio].div.parentElement)
			return;
		else
		{
			var allChildren = trivPage.iframe.contentWindow[trivPage.bkAudio].div.children||trivPage.iframe.contentWindow[trivPage.bkAudio].div.childNodes;

			if(allChildren.length > 0)
			{
				var bkObj = trivPage.iframe.contentWindow[trivPage.bkAudio];
				
				pagePlayer.bkAudioObj.actionChangeContents(bkObj.getSource());
				
				bkObj.rebuildMediaPlayer(pagePlayer.bkAudioObj.mediaElement, pagePlayer.bkAudioObj.mediaPlayer);
				
				if(bkObj.div.parentElement)
					bkObj.div.parentElement.removeChild(bkObj.div);
					
			}
			else
				setTimeout( function(){jsOpaUtils.transferBkAudio(trivPage);}, 100);
		}
	}
};

jsOpaUtils.prepBackgroundAudio = function(currPage, nextPage)
{
	if(currPage == u)
		return;
	else if(nextPage == u)
	{
		var THIS = this;
		setTimeout( function(){THIS.prepBackgroundAudio(currPage, nextPage);}, 100);
	}
	else
	{
		//LD-4655 Unset the player from the bkObj
		if(currPage.iframe.contentWindow[currPage.bkAudio])
			currPage.iframe.contentWindow[currPage.bkAudio].rebuildMediaPlayer(null, null);
		
		if(currPage.iframe.contentWindow[currPage.bkAudio] && nextPage.iframe.contentWindow[nextPage.bkAudio])
		{
			var currBkAudio = currPage.iframe.contentWindow[currPage.bkAudio];
			var nextBkAudio = nextPage.iframe.contentWindow[nextPage.bkAudio];
			//Only do something if they are the same source
			if(currBkAudio.getSource() == nextBkAudio.getSource())
			{
				if(nextBkAudio.div.parentElement)
					nextBkAudio.div.parentElement.removeChild(nextBkAudio.div);
			}
			else
			{
				pagePlayer.bkAudioObj.actionStop();
			}
		}
		else
		{
			pagePlayer.bkAudioObj.actionStop();
		}
	}
};

jsOpaUtils.refreshObjects = function(pageObj)
{
	if(pageObj.iframe.contentWindow.bPageLoaded && pageObj.iframe.contentWindow.bLoadedVariables)
	{
		var arObj = pageObj.iframe.contentWindow.arObjs;
		for(var index = 0; index < arObj.length; index++)
		{
			arObj[index].refresh();
		}
		//There is a posibility that an action will act on an objects that needs to be refreshed first
		//So moved the loadActions function call to happen after the refresh
		if(pageObj.iframe.contentWindow["loadActions"])
			pageObj.iframe.contentWindow["loadActions"]();
	}
	else
		setTimeout(function(){jsOpaUtils.refreshObjects(pageObj);},100);
};

jsOpaUtils.rvPage = function(pageObj)
{
	if(pageObj.iframe.contentWindow.bPageLoaded  && pageObj.iframe.contentWindow.bLoadedVariables)
	{
		jsOpaUtils.refreshObjects(pageObj);
		var arObj = pageObj.iframe.contentWindow.arObjs;
		for(var index = 0; index < arObj.length; index++)
			arObj[index].rv();
		
		pageObj.iframe.contentWindow.writeStyleSheets(arObj);
		
		if(pageObj.iframe.contentWindow["loadActions"])
			pageObj.iframe.contentWindow["loadActions"]();
	}
	else
		setTimeout(function(){jsOpaUtils.rvPage(pageObj);},100);	
};

//Helper function for preload
jsOpaUtils.cleanUpDestStr = function(pageStr)
{
	if(pageStr)
	{
		pageStr = pageStr.split(",")[0];
		pageStr = pageStr.replace("'","");
		pageStr = pageStr.replace("'","");
		pageStr = pageStr.trim();
	}
	
	return pageStr;
};

