/**************************************************
Trivantis (http://www.trivantis.com)
**************************************************/

var ocmOrig = getDisplayDocument().oncontextmenu
var ocmNone = new Function( "return false" )

// Media Object
function ObjMedia(n,a,x,y,w,h,v,z,m,l,p,rol,sPlay,eKey,vol,c,d,fb,cl) {
  this.name = n
  this.altName = a;
  this.source= ' SRC="'+m+'"'
  this.src = m;
  this.x = x;
  this.origX = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.oh = h;
  this.ow = w;
  this.bControl = c?true:false;
  //LD-3289: iOS: due to native controls need to switch bControl values for MEJS for no-skin
  if(!this.bControl && is.iOS && this.name.indexOf("audio")>=0)
	  this.bControl = true;
  this.bFixedPosition = false;
  this.isPlaying = false
  this.bRollControl = rol?false:true;
  this.bSinglePlay= sPlay?true:false;
  this.bEnableKeys = eKey?true:false;
  this.v = v
  this.z = z
  this.initVol = vol;
  this.bAutoStart = p?true:false;
  this.hasOnUp = false
  this.hasOnRUp = false
  this.obj = this.name+"Object"
  this.parmArray = new Array
  this.numParms = 0
  this.bLoop = l?true:false;
  this.bHasCaption = false;
  if( l ) this.loopString = ' LOOP="TRUE"'
  else this.loopString = ' LOOP="FALSE"'
  this.embed=''
  this.alreadyActioned = false;
  eval(this.obj+"=this")
  if ( d != 'undefined' && d!=null )
    this.divTag = d;
  else  
    this.divTag = "div";
    
  this.mediaType = '';
  this.mediaPlayer = null;
  this.mediaOptions = null;
  this.playerOptions = null;
  this.mediaElement = null;
  this.bMediaEle = false;
  this.capFile = [];
  this.capLang = []; 
  this.mediaSkin = null;
  this.arrMediaSkinFiles = new Array;
  this.arrEvents = new Array
    
  this.childArray = new Array  
  this.addClasses = cl;
  this.bOffPage = false;
  this.bBottom = fb?true:false;
  this.bBkAudio = this.name.indexOf("BkAudio")>-1?true:false;
  this.bInherited = false;
  this.bAllowAutoStart = (isSinglePagePlayerAvail() && is.isMobile.any())?false:true;
}

function ObjMediaBuildMediaString(){
  var autoStr=''
  var contStr=''
  var scaleStr=''
  var pluginType = ''
  var width=this.w
  var height=this.h
  var addIEheight=20
  this.isPlaying = this.bAutoStart;
  if( this.isPlaying ) autoStr = ' AUTOSTART="TRUE"'
  else autoStr = ' AUTOSTART="FALSE"'
    
  if(!this.MEJSMedia())
	{
	  if(this.source.indexOf(".mov") >= 0)
	  {
		this.mediaType = 'quick';
		pluginType = 'type=video/x-mov';
		if( this.c == 0) height += addIEheight;
		scaleStr=' scale="tofit"';
	  }
	  else if ( this.source.indexOf(".mp") >= 0 ) 
	  {
		if( this.c )
		  contStr += ' ShowControls="TRUE"'
		else
		  contStr += ' ShowControls="FALSE"'
	  }
	  else if( this.source.indexOf(".avi") >= 0 || this.source.indexOf(".wmv") >= 0 || this.source.indexOf(".asf") >= 0 ) 
	  {
		this.mediaType = 'media'
		if( !is.ns ) {
		  if( this.c ) {
			contStr += ' ShowControls="TRUE"'
			height += addIEheight
		  }
		  else contStr += ' ShowControls="FALSE"'
		}
	  }
	  else if( this.source.indexOf(".wma") >= 0 )  
		  this.mediaType = 'media';
	  else if( this.c ) 
	  {
		this.mediaType = 'quick'
		if( is.ns ) 
		{
		  var plugin = "audio/x-mpeg\""
		  var mimeType = eval( "navigator.mimeTypes[\"" + plugin + "]")
		  if( mimeType && (!mimeType.enabledPlugin || mimeType.enabledPlugin.name.indexOf( "QuickTime" ) < 0) ) {
			width = 145
			height = 60
		  }
		}
		else if( is.ieMac ) 
		  height -= 10;
		  if( !is.ns )
			 height += addIEheight;
	  }
	  else if( this.source.indexOf(".rm") >= 0 || this.source.indexOf(".ram") >= 0 ) 
	  {
		  this.mediaType = 'real'
		if( this.name.indexOf("video") >= 0 ) 
		{
		 contStr += ' controls="ImageWindow'
		 if( this.c ) contStr+=',ControlPanel'
		 contStr += '"'
		} else if ( this.c ) contStr=' controls="ControlPanel"'
	  }
	  
	  this.embed = '<EMBED' +this.source+contStr;
	  this.embed += ' WIDTH=' + width + ' HEIGHT=' + height ;
	  this.embed += ' NAME=' + this.name;
	  this.embed += autoStr+scaleStr+this.loopString+pluginType+'>\n';
  }
  else //If it not any of the cases above we can assume it is media element compatible
  {
	  var THIS=this;  
	  //Setup the Media Element options
	  var capSelection = -1;
	  if(typeof (window.VarTrivSelCap) == "object")
	  {
		  var capSel = window.VarTrivSelCap.getValue();
		  for (var i = 0; i < this.capLang.length; i++)
		  {
			 if( capSel == this.capLang[i])
			 {
				capSelection  = i;
				break;
			}
		  }
	  }
	  this.mediaOptions = { enablePluginDebug: false, plugins: ['flash','youtube','vimeo'], type: '', pluginPath: 'MediaPlayer/', flashName: 'flashmediaelement.swf',
							defaultVideoWidth: 480, defaultVideoHeight: 270, pluginWidth: -1, pluginHeight: -1, timerRate: 250, bAutoPlay: this.bAllowAutoStart?this.bAutoStart:false, pluginVars: ["smoothing=true"] ,
						// fires when a problem is detected
						error: function (){ console.log( "error creating media element" );}};
	  this.playerOptions = { defaultVideoWidth: 480, defaultVideoHeight: 270, videoWidth: -1, videoHeight: -1, audioWidth: this.w, audioHeight: this.h, startVolume: this.initVol,
							 loop: this.bLoop, enableAutosize: true, features: (!this.bControl)?['tracks']:['playpause','progress','current','duration','tracks','volume','fullscreen'], alwaysShowControls: this.bRollControl, hideVideoControlsOnLoad: this.bRollControl,
							 iPadUseNativeControls: !this.bControl, iPhoneUseNativeControls: !this.bControl, AndroidUseNativeControls: false, alwaysShowHours: false, showTimecodeFrameCount: false, framesPerSecond: 25,
							 enableKeyboard: this.bEnableKeys, pauseOtherPlayers: this.bSinglePlay, keyActions: [], startLanguage:((capSelection == -1)?'none':this.capLang[capSelection]),translationSelector:((this.capFile.length>1)?true:false),toggleCaptionsButtonWhenOnlyOne:is.ie8?true:false,
							 success:function(mediaElem, domObj){
								 THIS.mediaElement = mediaElem;
								 THIS.initEvent( mediaElem );
								 if( mediaElem.player )
									mediaElem.player.load();
								 else if( THIS.mediaPlayer )
									THIS.mediaPlayer.load();
							 },
							 error: function (){ 
								 console.log( "error creating media element player" );
							 }							 
						   };
	  this.bMediaEle = true;
  }  
}

function ObjMediaActionGoTo( destURL, destFrame ) {
  this.objLyr.actionGoTo( destURL, destFrame );
}

function ObjMediaAddParm( newParm ) {
  this.parmArray[this.numParms++] = newParm;
}

function ObjMediaActionGoToNewWindow( destURL, name, props ) {
  this.objLyr.actionGoToNewWindow( destURL, name, props );
}

function ObjMediaActionPlay( ) 
{
	if(this.bMediaEle)
	{
		if(this.mediaPlayer)
		{
			if(this.checkMediaLoad())
				this.mediaPlayer.play();
			else
			{
				var THIS = this;
				setTimeout(function(){THIS.actionPlay()}, 500);
			}
		}
		
	}
	else
	{
		if(this.mediaType == '')
			this.setType();
		if( this.mediaType == 'real')
			eval("getDisplayDocument()."+this.name+".DoPlayPause()");
		else if( this.mediaType == 'quick')
			eval("getDisplayDocument()."+this.name+".Play()");
		else if( this.mediaType == 'media' ) 
		{
			if( is.ieAny ) 
			  eval("getDisplayDocument()."+this.name+".play()");
			else if( is.ns )
			  eval("getDisplayDocument()."+this.name+".controls.play()");
		}
		else if(this.mediaType == 'wav')
		{
			if(!is.ie && !is.ie11)
			{
				var media = getHTMLEleByID(this.name+'Media');
				if(media)
				  media.play();
			}
			else
			{
				this.bAutoStart = true;
				this.BuildMediaString();
				this.objLyr.write( this.embed );  
			}
		}
		else 
		{  
			this.bAutoStart = true;
			this.BuildMediaString();
			this.objLyr.write( this.embed );
		} 
	}
	this.isPlaying = true;
}

function ObjMediaActionStop( ) 
{
	if(this.bMediaEle)
	{
		if(this.mediaPlayer)
		{
			if(this.checkMediaLoad())
			{
				if(!this.mediaPlayer.media.paused)
				{
					this.mediaPlayer.pause();
					this.mediaPlayer.setCurrentTime(0);
					if(this.playerOptions && this.playerOptions.mode == 'shim')
					{
						this.mediaPlayer.pause(); //LD-3133
						//LD-3152
						//******
						this.mediaPlayer.setCurrentRail();
						this.mediaPlayer.updateCurrent();
						//******
					}
				}
			}
			else
			{
				var THIS = this;
				setTimeout(function(){THIS.actionStop()}, 500);
			}
		}
	}
	else
	{
		this.bAutoStart = false;
		this.BuildMediaString();
		this.objLyr.write( this.embed );
	}
	this.isPlaying = false;
}

function ObjMediaActionPause( ) 
{
	if(this.bMediaEle)
	{
		if(this.mediaPlayer)
		{
			if(this.checkMediaLoad())
				this.mediaPlayer.pause();
			else
			{
				var THIS = this;
				setTimeout(function(){THIS.actionPause()}, 500);
			}
		}
	}
	else
	{
		if( this.mediaType == '')
			this.setType();
		  if( this.mediaType == 'real')
			eval("getDisplayDocument()."+this.name+".DoPause()");
		  else if( this.mediaType == 'quick')
			eval("getDisplayDocument()."+this.name+".Stop()");
		  else if(this.mediaType == 'wav')
		  {
			  if(!is.ie && !is.ie11)
			  {
				  var media = getHTMLEleByID(this.name+'Media');
				  if(media)
					  media.pause();
			  }
			  else
			  {
				this.BuildMediaString( false );
				this.objLyr.write( this.embed );  
			  }
		  }
		  else if( this.mediaType == 'media' ) {
			if( is.ieAny ) 
			  eval("getDisplayDocument()."+this.name+".pause()");
			else if( is.ns )
			  eval("getDisplayDocument()."+this.name+".controls.pause()");
		  }
		  else {  
			this.bAutoStart = false;
			this.BuildMediaString( false );
			this.objLyr.write( this.embed );
		  }	  
	}
	this.isPlaying = false;
}


function ObjMediaActionShow( ) {
  if( !this.isVisible() )
    this.onShow();
}

function ObjMediaActionHide( ) {
  if( this.isVisible() )
    this.onHide();
}

function ObjMediaActionLaunch( ) {
  this.objLyr.actionLaunch();
}

function ObjMediaActionExit( ) {
  this.objLyr.actionExit();
}

function ObjMediaActionChangeContents( newMedia ) {
	if (newMedia != null)
	{
		this.source = ' SRC="' +newMedia +'"';
		this.src = newMedia;
	}

	if(this.bMediaEle && newMedia != null)
	{
		if(this.mediaPlayer)
		{
			//LD-3239 
			if(this.checkMediaLoad())
			{
				this.mediaPlayer.setSrc(newMedia);
				this.mediaPlayer.load();
			}
			else
			{
				var THIS = this;
				setTimeout(function(){THIS.actionChangeContents(newMedia)}, 500);
			}
		}
	}
	else
	{
		this.bAutoStart = false;
		this.BuildMediaString();
		if( is.ns5 ) this.objLyr.ele.innerHTML=this.embed
		else this.objLyr.write( this.embed );
	}
}

function ObjMediaActionTogglePlay( ) {
  	if(this.bMediaEle)
		this.isPlaying = !this.mediaPlayer.media.paused;
	
	if(this.isPlaying == false)
		this.actionPlay();
	else
		this.actionPause(); 
}

function ObjMediaActionToggleShow( ) {
  if( ( is.ie && this.v ) || ( !is.ie && this.objLyr.isVisible() ) ) {this.actionHide(); this.mediaPlayer.hideControls(false, true);}
  else this.actionShow();
}

function ObjMediaSizeTo( w, h ) {
	this.w = w;
	this.h = h;
    if(!this.bMediaEle)
	{
		this.actionChangeContents();
	}
	else
	{
		var div = getHTMLEleByID(this.name);
		if(div)
		{
			div.style.width = this.w+'px';
			div.style.height = this.h+'px';
			if(this.mediaPlayer)
			{				
				if(typeof(this.mediaPlayer.setPlayerSize) != 'undefined')
					this.mediaPlayer.setPlayerSize(this.w,this.h);
				if(typeof(this.mediaPlayer.media.setVideoSize) != 'undefined')
					this.mediaPlayer.media.setVideoSize(this.w, this.h);
				if(typeof(this.mediaPlayer.setControlsSize) != 'undefined')
					this.mediaPlayer.setControlsSize();
			}
		}		
	}
}

{ //Setup prototypes
var p=ObjMedia.prototype
p.BuildMediaString = ObjMediaBuildMediaString
p.addParm = ObjMediaAddParm
p.build = ObjMediaBuild
p.init = ObjMediaInit
p.activate = ObjMediaActivate
p.capture = 0
p.up = ObjMediaUp
p.down = ObjMediaDown
p.over = ObjMediaOver
p.out = ObjMediaOut
p.onOver = new Function()
p.onOut = new Function()
p.onSelect = new Function()
p.onDown = new Function()
p.onUp = new Function()
p.onRUp = new Function()
p.actionGoTo = ObjMediaActionGoTo
p.actionGoToNewWindow = ObjMediaActionGoToNewWindow
p.actionPlay = ObjMediaActionPlay
p.actionStop = ObjMediaActionStop
p.actionShow = ObjMediaActionShow
p.actionHide = ObjMediaActionHide
p.actionLaunch = ObjMediaActionLaunch
p.actionExit = ObjMediaActionExit
p.actionChangeContents = ObjMediaActionChangeContents
p.actionTogglePlay = ObjMediaActionTogglePlay
p.actionToggleShow = ObjMediaActionToggleShow
p.writeLayer = ObjMediaWriteLayer
p.onShow = ObjMediaOnShow
p.onHide = ObjMediaOnHide
p.addFlashParams = ObjMediaFlashParams
p.addCaption = ObjMediaCaptionFile
p.isVisible = ObjMediaIsVisible
p.sizeTo    = ObjMediaSizeTo
p.onSelChg = new Function()
p.actionPause = ObjMediaActionPause
p.addSkin = ObjMediaPlayerSkin
p.loadProps = ObjLoadProps
p.respChanges = ObjRespChanges
p.setType = ObjSetMediaType
p.validateSrc = ObjMediaValidSource
p.checkMediaLoad = ObjMediaCheckPlayerLoad
p.MEJSMedia = ObjMediaMEJSPlayable
p.isVideo = ObjMediaIsVideo
p.isAudio = ObjMediaIsAudio
p.getSource = ObjMediaGetSource
p.getTrackTime = ObjMediaGetTrackTime
p.setTrackTime = ObjMediaSetTrackTime
p.refresh = ObjMediaRefresh
p.getPreloadString = ObjMediaGetPreloadString
p.getCSS = ObjMediaGetCSS
p.rv = ObjMediaRV
p.rebuildMediaPlayer = ObjMediaRebuildPlayer
p.removeAllMediaListeners = ObjMediaRemoveListeners

p.actionMute = function(){
	this.mediaElement.setMuted(true);
};

p.actionUnmute = function(){
	this.mediaElement.setMuted(false);	
};

p.initEvent = function(mediaElement){
	var THIS = this;
		
	if(mediaElement)
	{
		mediaElement.addEventListener("timeupdate", 
			function (e) 
			{
				for (var i=0; i < THIS.arrEvents.length; i++) 
				{
					if (!(THIS && mediaElement))
						return;
					var trivEvent = THIS.arrEvents[i];
					if (!trivEvent.proc && !mediaElement.paused &&
						mediaElement.currentTime >= trivEvent.time && 
						mediaElement.currentTime <= mediaElement.duration)
					{
						trivEvent.proc = true;
						window[trivEvent.func]();
					}
				}
				if (!(THIS && THIS.clearEventsFlag))
						return;
				THIS.clearEventsFlag(mediaElement.currentTime)
				
			},	false);
			
		mediaElement.addEventListener("ended", 
			function (e){ 
			
				//console.log("ended");
				THIS.clearEventsFlag(-1) 
				
				try{ 
					var onDoneFunc = eval( THIS.name + 'onDone' );
					onDoneFunc(THIS)
				}catch(e){}
				
			},	false
		);
	}		
};

p.clearEventsFlag = function(pos){
    for (var i = 0; i < this.arrEvents.length; i++) 
	{
		var ev = this.arrEvents[i];
        if (ev.proc && pos < ev.time)
            ev.proc = false;
    }
};

p.addEvent = function(time, fn){
    var TrivEvent = new Object();
    TrivEvent.time = time;
    TrivEvent.func = fn;
    TrivEvent.proc = false;
    this.arrEvents[this.arrEvents.length] = TrivEvent;
};

}

function ObjMediaBuild() 
{
  this.loadProps();
    
  this.css = this.getCSS();
  
  this.bInherited = checkObjectInheritance(this);
  if(this.bInherited)
	  return;
  
  this.div = '<' + this.divTag + ' id="'+this.name+'"'
  if( this.addClasses ) this.div += ' class="'+this.addClasses+'"'
  this.div += '>';
  
   
  if(!this.bMediaEle)
  {
	  this.div+= '<a name="'+this.name+'anc"'
	  if( this.w ) this.div += ' href="javascript:' +this.name+ '.onUp()"'
	  this.div += '></a>'
	  this.divInt = this.embed;
 
  }
  else
  {
	  if(this.isVideo())
	  {
		  //LD-3943 -- Updated
	      this.divInt = '<video width=\'' + this.w + 'px\' height=\'' + this.h + 'px\' ' + (this.bControl ? "controls=\"controls\"" : "") + ' id=\'' + this.name + 'Media\' name=\'' + this.name + 'Media\' ' + ((this.bAutoStart && this.bAllowAutoStart) ? "autoplay=\"autoplay\"" : "") + (is.iOS?' playsinline':' webkit-playsinline')+'>';
		  if(this.source.indexOf(".mp4") >=0)
			this.divInt += '<source  type="video/mp4" src="'+this.src+'"/>';
		  else if(this.source.indexOf(".m4v") >=0)
			this.divInt += '<source  type="video/m4v" src="'+this.src+'"/>';
		  else if(this.source.indexOf("youtube") >=0 || this.source.indexOf("yout.ube") >=0) //Experimental might want to backout
			this.divInt += '<source  type="video/youtube" src="'+this.src+'"/>';
		  else if(this.source.indexOf(".flv") >=0)
			this.divInt += '<source  type="video/flv" src="'+this.src+'"/>';
		  else if(this.source.indexOf(".f4v") >=0)
			this.divInt += '<source  type="video/flv" src="'+this.src+'"/>';
		  else if(this.source.indexOf(".wmv") >=0)
			this.divInt += '<source  type="video/wmv" src="'+this.src+'"/>';		
		  else
		  {
			  this.divInt += '<object width=\''+this.w+'px\' height=\''+this.h+'px\' type="application/x-shockwave-flash" data="mediaFiles/flashmediaelement.swf">';
			  this.divInt += '<param name="movie" value="mediaFiles/flashmediaelement.swf"/>'
			  this.divInt += '<param name="flashvars" value="'+this.flashParam+'"/>'
			  this.divInt += '</object>'
		  }			  
	  }
	  else if(this.isAudio())
	  {
		  this.divInt = '<audio width=\''+this.w+'px\' height=\''+this.h+'px\' '+(this.bControl?"controls=\"controls\"":"")+' id=\''+this.name+'Media\' name=\''+this.name+'Media\' '+(this.bAutoStart?"autoplay=\"autoplay\"":"")+'>';
		  if(this.source.indexOf(".mp3") >=0)
			this.divInt += '<source  type="audio/mp3" src="'+this.src+'"/>';
		  else if(this.source.indexOf(".m4a") >=0)//LD-3221
			this.divInt += '<source  type="audio/m4a" src="'+this.src+'"/>';
		  else if(this.source.indexOf(".mp4") >=0)
			this.divInt += '<source  type="audio/mp4" src="'+this.src+'"/>';
		  else if(this.source.indexOf(".wav") >=0)
			this.divInt += '<source  type="audio/wav" src="'+this.src+'"/>';
		  else
		  {
			  this.divInt += '<object width=\''+this.w+'px\' height=\''+this.h+'px\' type="application/x-shockwave-flash" data="mediaFiles/flashmediaelement.swf">';
			  this.divInt += '<param name="movie" value="mediaFiles/flashmediaelement.swf"/>'
			  this.divInt += '<param name="flashvars" value="'+this.flashParam+'"/>'
			  this.divInt += '</object>'
		  }	
	  }
	  else
		  alert("Unknown media format");
	  
	  if(this.bHasCaption)
	  {
		  for(var index = 0; index < this.capFile.length; index++)
		  {
			  this.divInt+= '<track kind="subtitles" src="'+this.capFile[index]+'" srclang="'+this.capLang[index]+'" />'
		  }
	  }
	 
	 if(this.isVideo())
		   this.divInt += '</video>';
	 else if(this.isAudio())
			this.divInt+= '</audio>';
  }
  this.div +=  '</' + this.divTag + '>\n';
  
  this.div = CreateHTMLElementFromString(this.div);
}

function ObjMediaInit() {
  this.objLyr = new ObjLayer(this.name, null, null, this.div)
  if(!isSinglePagePlayerAvail() && !window.bTrivResponsive) adjustForFixedPositon(this);
}

function ObjMediaActivate() {
  if(this.objLyr && this.objLyr.styObj && !this.alreadyActioned )
	if( this.v ) 
		this.actionShow()
  if(!this.bMediaEle)
  {
	  if(!this.bInherited)
	  {
			if( this.capture & 4 ) 
			{
				this.objLyr.ele.onmousedown = new Function("event", this.obj+".down(event); return false;")
				this.objLyr.ele.onmouseup = new Function("event", this.obj+".up(event); return false;")
			}
			if( this.capture & 1 ) 
				this.objLyr.ele.onmouseover = new Function(this.obj+".over(); return false;")
			if( this.capture & 2 ) 
				this.objLyr.ele.onmouseout = new Function(this.obj+".out(); return false;")
			if( this.embed && (!is.ie || !this.v ) )
			{
				if( is.ns5 ) 
					this.objLyr.ele.innerHTML = this.embed;
				else 
					this.objLyr.write( this.embed );
			}

			if(this.source.indexOf(".wav") >= 0)
			{
				if(!is.ie && !is.ie11)
				{
					var funcOnDone = null;
					try{funcOnDone=eval( this.name + 'onOver' );}catch(error){}
					 var medobj = getChildNodeByID(this.objLyr.ele, this.name+'Media');
					 if(medobj&&funcOnDone) medobj.addEventListener('ended', funcOnDone, false);
				}
			}
	  }
  }
  else
  {
	  if(!this.bInherited)
	  {
		  if( is.ns5 )
		  {		  
			if(this.objLyr.ele)
				this.objLyr.ele.innerHTML = this.divInt;
		  }
		  else 
			this.objLyr.write( this.divInt );
	  
	
		var medEle = getChildNodeByID(this.objLyr.ele, this.name+'Media');
	  
		this.mediaElement = new MediaElement(medEle?medEle:this.name+'Media', this.mediaOptions);
		//If there is plugin type then change the mode to shim
		if(this.mediaElement && this.mediaElement.pluginType && (this.mediaElement.pluginType.indexOf('flash') >-1 || this.mediaElement.pluginType.indexOf('silverlight') >-1))
		{
		  this.playerOptions.mode = 'shim';
		  var container = getHTMLEleByID(this.mediaElement.id+"_container");
		  if(container)
			  container.parentNode.removeChild(container);
		  
		  delete this.mediaElement;
		}

		this.mediaPlayer = new MediaElementPlayer(this.mediaElement?this.mediaElement:medEle?medEle:getHTMLEleByID(this.name+"Media"), this.playerOptions);
		if(this.mediaSkin)
		  this.mediaPlayer.changeSkin(this.mediaSkin);

		//LD-3289: iOS-fix
		if( (!this.bControl && !is.iOS )||(this.w < 185 && this.bControl) || this.bBkAudio)
		  this.mediaPlayer.changeSkin("mejs-noskin");

		//LD-3147 ---LHD
		if(this.bAutoStart && this.playerOptions && this.playerOptions.mode == 'shim')
		  this.actionPlay();
	  }	  
  }
  
  this.objLyr.theObj = this;
}

function ObjMediaDown(e) {
  if( is.ie ) e = event || e
  if( is.ie && !is.ieMac && e.button != 0 && e.button!=1 && e.button!=2 ) return
  if( is.ieMac && e.button != 0 ) return
  if( is.ns && e.button!=0 && e.button!=2 ) return
  this.onSelect()
  this.onDown()
}

function ObjMediaUp(e) {
  if( is.ie ) e = event || e
  if( is.ie && !is.ieMac && e.button != 0 && e.button!=1 && e.button!=2 ) return
  if( is.ieMac && e.button!=0 ) return
  if( is.ns && e.button!=0 && e.button!=2 ) return
  if( e.button==2 )
  {
    if( this.hasOnRUp )
    {
      getDisplayDocument().oncontextmenu = ocmNone
      this.onRUp()
      setTimeout( "getDisplayDocument().oncontextmenu = ocmOrig", 100)
    }
  }
  else if( !is.ns5 )
    this.onUp()
}

function ObjMediaOver() {
  this.onOver()
}

function ObjMediaOut() {
  this.onOut()
}

function ObjMediaWriteLayer( newContents ) {
  if (this.objLyr) this.objLyr.write( newContents )
}

function ObjMediaOnShow() {
  this.alreadyActioned = true;
  if( is.ie && !this.bMediaEle) {
    this.v = true;
	this.bAutoStart = this.isPlaying;
    this.BuildMediaString();
    this.objLyr.write( this.embed );
  }
  this.objLyr.actionShow();
}

function ObjMediaOnHide() {
  this.alreadyActioned = true;
  if( is.ie && !this.bMediaEle) {
    this.v = false;
	this.bAutoStart = this.isPlaying;
    this.BuildMediaString();
    this.objLyr.write( this.embed );
  }
  this.objLyr.actionHide();
}

function ObjMediaIsVisible() {
  if( this.objLyr.isVisible() )
    return true;
  else
    return false;
}

function ObjMediaFlashParams(strParam)
{
	this.flashParam = strParam;
}

function ObjMediaCaptionFile(fcap, lang)
{
	this.bHasCaption = true;
	this.capLang.push(lang);
	this.capFile.push(fcap);	
}

function ObjMediaPlayerSkin(skinClass, cssFileName)
{
	this.mediaSkin = skinClass;
	if(typeof(cssFileName) !="undefined")
	{
		this.arrMediaSkinFiles.push(cssFileName);
		AddFileToHTML(cssFileName, 'css');
	}
}

function ObjLoadProps()
{
	if(is.jsonData != null)
	{
		var respValues = is.jsonData[is.clientProp.device];
		var newValues;
		newValues = respValues[is.clientProp.width];
		var obj = newValues[this.name];
		if(obj)
		{
			this.x = typeof(obj.x)!="undefined"?obj.x:this.x;
			this.origX = typeof(obj.x)!="undefined"?obj.x:this.x;
			this.y = typeof(obj.y)!="undefined"?obj.y:this.y;
			this.w = typeof(obj.w)!="undefined"?obj.w:this.w;
			this.h = typeof(obj.h)!="undefined"?obj.h:this.h;
			this.bBottom = (typeof(obj.bOffBottom)!="undefined"?obj.bOffBottom:this.bBottom);
			
			if(this.x > GetPageWidth() || ((this.x + this.w) < 0))
				this.bOffPage = true;
			else
				this.bOffPage = false;
			
		}
	}
}

function ObjRespChanges()
{
	if(this.name.indexOf('video') >-1)
	{
		if(this.objLyr)
		{
			if(this.bMediaEle)
			{
				//LD-3289: iOS-fix: Resize for when using native controls
				if( is.iOS && !this.bControl )
				{
					if(typeof(this.mediaPlayer.media.setVideoSize) != 'undefined')
						this.mediaPlayer.media.setVideoSize(this.w, this.h);
				}
				else
				{
					var wasFullScreen = this.mediaPlayer.isFullScreen;
					if( wasFullScreen )	this.mediaPlayer.setFullscreen(false);
						
					
					if(typeof(this.mediaPlayer.setPlayerSize) != 'undefined')
						this.mediaPlayer.setPlayerSize(this.w,this.h);
					if(typeof(this.mediaPlayer.media.setVideoSize) != 'undefined')
						this.mediaPlayer.media.setVideoSize(this.w, this.h);
					if(typeof(this.mediaPlayer.setControlsSize) != 'undefined')
						this.mediaPlayer.setControlsSize();
					if( this.w < 185 || !this.bControl)
						this.mediaPlayer.changeSkin("mejs-noskin");
					else if(this.mediaSkin)
						this.mediaPlayer.changeSkin(this.mediaSkin);
					else
						this.mediaPlayer.changeSkin('');
					
					
					if( wasFullScreen )	this.mediaPlayer.setFullscreen(true);
				}
				
				
			}
			else
				this.sizeTo(this.w, this.h);
		}
	}
	
	//Adjust the CSS
	FindAndModifyObjCSSBulk(this);
}

function ObjSetMediaType()
{
	if( this.source.indexOf(".rm") >= 0 ||
		this.source.indexOf(".ram") >= 0 )
			this.mediaType = 'real';
	else if( this.source.indexOf(".avi") >= 0 || 
		  this.source.indexOf(".wmv") >= 0 || 
		  this.source.indexOf(".asf") >= 0 ||
		  this.source.indexOf(".wma") >= 0 )  
			this.mediaType = 'media';
	else if (this.source.indexOf(".mov") >= 0 || 
		   this.source.indexOf(".mp4") >= 0 ||
		   this.source.indexOf(".aif") >= 0 || 
		   this.source.indexOf(".mid") >= 0 ||
		   this.source.indexOf(".au") >= 0) 
			this.mediaType = 'quick';
	else if(this.source.indexOf(".wav") >= 0)
		this.mediaType = 'wav';
}

function ObjMediaValidSource()
{
	if(this.bOffPage)
	{
		this.bOffPage = false;
		this.actionChangeContents(this.src);
	}
}

function ObjMediaCheckPlayerLoad()
{
	if(this.mediaPlayer.media.player && !this.mediaPlayer.media.player.isLoaded)
	{
		return false;
	}
	else
		return true;
		
}

//LD-3221 LD-3220
function ObjMediaMEJSPlayable()
{
	var bIsMEJSPlayable = true;
	if(	this.source.indexOf(".mov") >= 0 || this.source.indexOf(".rm") >= 0 || this.source.indexOf(".ram") >= 0 || this.source.indexOf(".wma") >= 0 	|| 
		this.source.indexOf(".wmv") >= 0 || this.source.indexOf(".asf") >= 0 || this.source.indexOf(".au") >= 0 || this.source.indexOf(".mid") >= 0 	|| 
		this.source.indexOf(".midi") >= 0 || this.source.indexOf(".aiff") >= 0 || this.source.indexOf(".aif") >= 0 || this.source.indexOf(".avi") >= 0 ||
		this.source.indexOf(".mpg") >= 0 || this.source.indexOf(".mpa") >= 0 )
			bIsMEJSPlayable = false;
	
	return bIsMEJSPlayable;
}

function ObjMediaIsVideo()
{
	var bIsVideo = false;
	if(this.name.toLowerCase().indexOf("video")>=0)
		bIsVideo = true;
	return bIsVideo;
}

function ObjMediaIsAudio()
{
	var bIsAudio = false;
	if(this.name.toLowerCase().indexOf("audio")>=0 || this.name.toLowerCase().indexOf("sound")>=0)
		bIsAudio = true;
	return bIsAudio;
}

function ObjMediaGetSource()
{
	return this.src;
}

function ObjMediaGetTrackTime()
{
	var time = 0;
	if(this.bMediaEle)
	{
		time = this.mediaElement.currentTime;
	}
	return time;
}

function ObjMediaSetTrackTime(time)
{
	if(this.bMediaEle)
	{
		this.mediaPlayer.setCurrentTime(time);
		this.mediaPlayer.setCurrentRail();
	}
}

function ObjMediaRefresh(){
	if(this.bInherited)
	{
		//If it is an inherited object the DIV might not reflect the correct dom element
		if(!this.div.parentElement)
			this.div = getHTMLEleByID(this.name);
		
		if(!this.bMediaEle)
		{
			if( this.capture & 4 ) 
			{
				this.objLyr.ele.onmousedown = new Function("event", this.obj+".down(event); return false;")
				this.objLyr.ele.onmouseup = new Function("event", this.obj+".up(event); return false;")
			}
			if( this.capture & 1 ) 
				this.objLyr.ele.onmouseover = new Function(this.obj+".over(); return false;")
			if( this.capture & 2 ) 
				this.objLyr.ele.onmouseout = new Function(this.obj+".out(); return false;")
			if( this.embed && (!is.ie || !this.v ) )
			{
				if( is.ns5 ) 
					this.objLyr.ele.innerHTML = this.embed;
				else 
					this.objLyr.write( this.embed );
			}

			if(this.source.indexOf(".wav") >= 0)
			{
				if(!is.ie && !is.ie11)
				{
					var funcOnDone = null;
					try{funcOnDone=eval( this.name + 'onOver' );}catch(error){}
					 var medobj = getChildNodeByID(this.objLyr.ele, this.name+'Media');
					 if(medobj&&funcOnDone) medobj.addEventListener('ended', funcOnDone, false);
				}
			}
		}
		else
		{
			var medEle = getChildNodeByID(this.objLyr.ele, this.name+'Media');
		  
			if(!this.mediaElement)
				this.mediaElement = new MediaElement(medEle?medEle:this.name+'Media', this.mediaOptions);
			//If there is plugin type then change the mode to shim
			if(this.mediaElement && this.mediaElement.pluginType && (this.mediaElement.pluginType.indexOf('flash') >-1 || this.mediaElement.pluginType.indexOf('silverlight') >-1))
			{
			  this.playerOptions.mode = 'shim';
			  var container = getHTMLEleByID(this.mediaElement.id+"_container");
			  if(container)
				  container.parentNode.removeChild(container);
			  
			  delete this.mediaElement;
			}
			
			if(!this.mediaPlayer)
				this.mediaPlayer = new MediaElementPlayer(this.mediaElement?this.mediaElement:medEle?medEle:getHTMLEleByID(this.name+"Media"), this.playerOptions);
			
			if(this.mediaSkin)
			  this.mediaPlayer.changeSkin(this.mediaSkin);

			//LD-3289: iOS-fix
			if( (!this.bControl && !is.iOS )||(this.w < 185 && this.bControl) || this.bBkAudio)
			  this.mediaPlayer.changeSkin("mejs-noskin");			

		}
	}
	
}

function ObjMediaGetPreloadString()
{
	var strPreloads = "'" + this.src + "'";
	for ( var idx=0; idx<this.arrMediaSkinFiles.length; idx++ )
	{
		if (this.arrMediaSkinFiles[idx] && this.arrMediaSkinFiles[idx].length )
			strPreloads += ",'" + this.arrMediaSkinFiles[idx] + "'";
	}
	return strPreloads;
}

function ObjMediaGetCSS(){
	var css = '';
	css = buildCSS(this.name,this.bFixedPosition,this.x,this.y,this.w,null,this.v,this.z);
	return css;
}

function ObjMediaRV(){
	this.loadProps();
	if(!window.bTrivResponsive)
	{
		this.h = this.oh;
		this.w = this.ow;
	}
	this.css = this.getCSS();
	this.refresh();
	
	if(this.objLyr && this.objLyr.objDiv)
	{
		for(var index = 0; index < this.objLyr.objDiv.style.length;index++)
		{
			var styleName = this.objLyr.objDiv.style[index];
			this.objLyr.objDiv.style[styleName]="";
		}
		if(!this.v)
			this.objLyr.objDiv.style.visibility = 'hidden';
	}
}

function ObjMediaRebuildPlayer(mediaElementToUse, mediaPlayerToUse, id){
	if(this.bMediaEle)
	{
		if(this.mediaElement)
		{
			delete this.mediaElement;
			this.mediaElement = mediaElementToUse;
		}
		
		if(this.mediaPlayer)
		{
			delete this.mediaPlayer;
			this.mediaPlayer = mediaPlayerToUse;
		}
		
		//LD-4624 -Unset player occured
		if(!this.mediaElement && !this.mediaPlayer)
			return;
		
		var div = getHTMLEleByID(this.name);
		//Hide Old DIV
		if(div)
		{
			div.style.visibility = 'hidden';
			div.id = div.id+'TMP';
		}
		//LD-4655 --- Only linking the players
		if(!id)
			return;
		
		div = getHTMLEleByID(id);
		
		div.id = this.name;
		div.visibility = '';
		
		//Update ObjLayer
		this.objLyr = new ObjLayer(this.name, null, null, div)
		var tracks = div.getElementsByTagName("track");
		
		if(tracks.length)
			tracks = tracks[0];
		else
			tracks = null;

		//Currently only being set for one language
		if(this.bHasCaption)
		{
			if(tracks)
			{
				tracks.src = this.capFile[0];
				tracks.srclang = this.capLang[0];
			}
			else
			{
				tracks = getDisplayDocument().createElement("track");
				tracks.kind = 'subtitles';
				tracks.src = this.capFile[0];
				tracks.srclang=this.capLang[0];
				var mediaEle = this.isVideo()?div.getElementsByTagName("video"):div.getElementsByTagName("audio");
				if(mediaEle.length)
				{
					mediaEle = mediaEle[0];
					mediaEle.appendChild(tracks);
				}
			}
		}
		else
		{
			if(tracks && tracks.parentElement)
				tracks.parentElement.removeChild(tracks);
		}
		
		this.mediaPlayer.setTrack('none');
		if(this.bHasCaption)
		{
			this.mediaPlayer.findTracks();
			this.mediaPlayer.loadTrack(0);
			if(typeof (getDisplayWindow().VarTrivSelCap) == "object" && getDisplayWindow().VarTrivSelCap.getValue() == this.capLang[0])
				this.mediaPlayer.setTrack(this.capLang[0]);
		}
		else
			this.mediaPlayer.captionsButton.remove();
		
		if(this.isVideo() && this.bRollControl)
			this.mediaPlayer.controls.addClass("mejs-roll");
		
		if(this.v)
			this.actionShow()
		
		if(this.mediaSkin)
		  this.mediaPlayer.changeSkin(this.mediaSkin);
		else
		  this.mediaPlayer.changeSkin(""); //LD-5604 - else clear the skin

		//LD-3289: iOS-fix
		if( (!this.bControl && !is.iOS )||(this.w < 185 && this.bControl) || this.bBkAudio)
		  this.mediaPlayer.changeSkin("mejs-noskin");				
	}
}

function ObjMediaRemoveListeners(){
	if(this.mediaPlayer && this.mediaPlayer.media)
	{
		this.mediaPlayer.media.removeEventListener('progress',this.mediaPlayer.progFunc);
		this.mediaPlayer.media.removeEventListener('timeupdate',this.mediaPlayer.timeFunc);
		this.mediaPlayer.media.removeEventListener('timeupdate',this.mediaPlayer.dispCap);
		this.mediaPlayer.media.removeEventListener('timeupdate',this.mediaPlayer.curFunc);
		this.mediaPlayer.media.removeEventListener('timeupdate',this.mediaPlayer.durFunc);
		this.mediaPlayer.media.removeEventListener('timeupdate',this.mediaPlayer.dispSlides);
	}
}