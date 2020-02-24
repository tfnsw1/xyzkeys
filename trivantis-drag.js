/**************************************************
Trivantis (http://www.trivantis.com)
**************************************************/
var dragOffX = 0
var dragOffY = 0

function mycreatediv(id,left,top,width, height, color, hide) {

	var newdiv = getDisplayDocument().createElement('div'); 
	newdiv.setAttribute('id', id); 
	if (width) { newdiv.style.width = width+ 'px'; } 
	if (height) { newdiv.style.height = height+ 'px'; } 
	if (left || top) 
	{ 
		newdiv.style.position = "absolute"; 
		if (left) { newdiv.style.left = left + 'px'; } 
		if (top) { newdiv.style.top = top+ 'px'; } 
	} 
	newdiv.style.zIndex = DragMgr_zIdx-1; 
	newdiv.style.borderWidth = "2px";
	if ( hide ) 
		newdiv.style.borderStyle = "none";
	else
		newdiv.style.borderStyle = "solid";
	newdiv.style.borderColor = color;

	getDisplayDocument().body.getElementsByTagName('fieldset')[0].appendChild(newdiv);
	return newdiv;
}

function ShowDropZones(set)
{
	for(var i=0; i<this.arrDropPts.length; i++)
	{
		if ( this.arrDropPts[i] && this.arrDropPts[i].div )
		{
			if ( set==1 || ( set==2 && this.arrDropPts[i].div.style.borderStyle == "none" ) )
				this.arrDropPts[i].div.style.borderStyle = "solid";
			else if ( set==0 || ( set==2 &&  this.arrDropPts[i].div.style.borderStyle == "solid" ) )
				this.arrDropPts[i].div.style.borderStyle = "none";
		}
	}
}

function DrawDropZones(color, hide)
{
	for(var i=0; i<this.arrDropPts.length; i++)
	{
		if( this.arrDropPts[i].div ) 
		{
			this.arrDropPts[i].div.parentNode.removeChild(this.arrDropPts[i].div );
			this.arrDropPts[i].div = null;
		}
	}
	for(var i=0; i<this.arrDropPts.length; i++)
		this.arrDropPts[i].div = mycreatediv("dropzone"+i, this.arrDropPts[i].x, this.arrDropPts[i].y, this.arrDropPts[i].w, this.arrDropPts[i].h, color, hide);
	
	for(var i=0; i<this.arrDragItems.length; i++)
		this.arrDragItems[i].lyr.objLyr.styObj.zIndex = DragMgr_zIdx+i;
}

function DropPt( x,y,w,h,id,f ) {
    this.x = x
    this.y = y
	this.w = w
	this.h = h
    this.dropId = id
    this.dragItem = null
    this.updFunc = f
    this.checkWithinRect = DropRectWithin
	this.div
}

function DropRectWithin( item, expand ) {
    var itemW = item.lyr.objLyr.w
    var itemH = item.lyr.objLyr.h
    var itemX = item.lyr.objLyr.x
    var itemY = item.lyr.objLyr.y
    var dX
    var dY
    var d
	var dropCenter = {x:0,y:0}
	dropCenter.x = this.x+this.w/2
	dropCenter.y = this.y+this.h/2
	
	dX = this.w/2
	dY = this.h/2

    if( this.updFunc == item.lyr.updateDragFunc ) 
    {
      if( (itemX+itemW/2 >= dropCenter.x - dX  && itemX+itemW/2<= dropCenter.x + dX) &&
          (itemY+itemH/2 >= dropCenter.y - dY  && itemY+itemH/2 <= dropCenter.y + dY) ) 
        return true;
    }
    return false;
}

function DragItem( lyr ) {
    this.lyr = lyr
    this.checkWithinItem = DragItemWithin
    this.restoreInit = DragItemRestore
    this.name = lyr.name
}

function DragItemWithin( x,y ) {
    x -= dragOffX
    y -= dragOffY
    if( x >= this.lyr.objLyr.x*transformScale &&
        y >= this.lyr.objLyr.y*transformScale &&
        x <= ((this.lyr.objLyr.x + this.lyr.objLyr.w)*transformScale) &&
        y <= ((this.lyr.objLyr.y + this.lyr.objLyr.h)*transformScale) )
        return true;
    else
        return false;
}

function DragItemRestore(func) {
	if ( !func ||  func == this.lyr.updateDragFunc ) 
	{

		this.lyr.objLyr.moveTo( this.lyr.x, this.lyr.y )		
		this.lyr.objLyr.styObj.left = null;
		this.lyr.objLyr.styObj.top = null;
		if( this.lyr.dropObj ) 
		{
		  this.lyr.dropObj.dragItem = null
		  this.lyr.dropObj = null
		}
	}
}

function DragItemDrop() {
    if( this.item.lyr.updateDragFunc )
        this.item.lyr.updateDragFunc()
}

function DragSetOffset( left, top ) {
    dragOffX = left;
    dragOffY = top;
}

var DragMgr_zIdx = 1000; // Must be lower than the jsDialog z index

function DragMgr() {
    this.item = null
    this.arrDragItems = new Array()
    this.arrDropPts = new Array()
    this.active = false
    this.offX = 0
    this.offY = 0
	this.drawDropZones = DrawDropZones
	this.showDropZones = ShowDropZones
    this.addDrag = AddDragItem
    this.addDrop = AddDropPt
    this.checkDrops = DragCheckDropPts
    this.mouseDown = DragMouseDown
    this.mouseMove = DragMouseMove
    this.mouseUp = DragMouseUp
    this.onDragDrop = DragItemDrop
    this.setDropById = DragSetDropById
    this.offsetDrag = DragSetOffset
    this.reset = Reset
    this.bSnapToCenter = false;
	this.clearDropZones = DragClearDropZones
}
function DragClearDropZones()
{
	for( var i=0; i<this.arrDropPts.length; i++ )
	{
		if( this.arrDropPts[i].div )
			this.arrDropPts[i].div.parentElement.removeChild(this.arrDropPts[i].div);
	}
	this.arrDropPts = new Array() 
}
function AddDragItem( lyr, id, func ) {
    var idx = this.arrDragItems.length
    this.arrDragItems[idx] = new DragItem( lyr )
    lyr.capture = 4
    lyr.dragId = id
    lyr.dropObj = null
    lyr.updateDragFunc = func
}
function AddDropPt(x,y,w,h,id,f) {
	
    var idx = this.arrDropPts.length
    this.arrDropPts[idx] = new DropPt( x,y,w,h,id,f )
}
function Reset() {
    for (var i=this.arrDragItems.length-1;i>=0;i--) 
	this.arrDragItems[i].restoreInit()
}
function DragMouseDown(x,y,e) {
    for (var i=this.arrDragItems.length-1;i>=0;i--) 
    {
      var dItem = this.arrDragItems[i]
      if (dItem.checkWithinItem(x,y)) 
      {
        var targ;
        if (!e) var e = getDisplayWindow().event;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        while( targ && 
               ( !targ.id || targ.id.indexOf( dItem.name ) == -1 ) &&
               ( !targ.name || targ.name.indexOf( dItem.name ) == -1 ) )
        {        
            targ = targ.parentNode
        }
        if( !targ )
          return false;
		  
		if( targ.disabled )
			return false;
        this.item = dItem
        this.offX = (x/transformScale)-this.item.lyr.objLyr.x;
        this.offY = (y/transformScale)-this.item.lyr.objLyr.y;
        if( this.item.lyr.dropObj ) 
        {
          this.item.lyr.dropObj.dragItem = null
          this.item.lyr.dropObj = null
          this.onDragDrop() // Clear
        }
		this.active = true
		break
      }
    }
    if (!this.active) return false
    else return true
}
function DragMouseMove(x,y) {
    if (!this.active) return false
    else 
    {
      this.item.lyr.objLyr.moveTo((x/transformScale)-this.offX,(y/transformScale)-this.offY)
      return true
    }
}
function DragMouseUp(x,y) {
    if (!this.active) return false
    else 
    {
      this.active = false
      if (this.checkDrops()) this.onDragDrop()
      else this.item.restoreInit()
      return true
    }
}
function DragCheckDropPts() {
    for( var pass = 0; pass < 2; pass++ ) 
    {
      for (var i = this.arrDropPts.length-1;i>=0;i--) 
      {
        var dropPt = this.arrDropPts[i]
    	if (dropPt.checkWithinRect(this.item, pass )) 
    	{
    	  dropPt.dragItem = this.item
    	  this.item.lyr.dropObj = dropPt
		  if( this.bSnapToCenter )
			this.item.lyr.objLyr.moveTo( dropPt.x + dropPt.w/2 - this.item.lyr.objLyr.w/2, dropPt.y + dropPt.h/2 - this.item.lyr.objLyr.h/2 )
          return true
		}
      }
    }
    return false
}

function DragSetDropById( itemId, dropId, func ) {
    for (var i=this.arrDragItems.length-1;i>=0;i--) 
    {
      var dItem = this.arrDragItems[i]
      if( dItem.lyr.dragId == itemId && dItem.lyr.updateDragFunc == func ) 
      {
	var j = this.arrDropPts.length-1;
        for (;j>=0;j--) 
        {
          var dropPt = this.arrDropPts[j]
          if (dropPt.dropId == dropId && dropPt.updFunc == func ) 
          {
            dropPt.dragItem = dItem
            dItem.lyr.dropObj = dropPt
            dItem.lyr.objLyr.moveTo( dropPt.x + dropPt.w/2 - dItem.lyr.objLyr.w/2, dropPt.y + dropPt.h/2 - dItem.lyr.objLyr.h/2 )
			dItem.lyr.objLyr.hasMoved = true;//If auto moving the item to droppoint then update the hasMoved flag;
            return true
          }
        }
	if( j <= -1 )
	{
		dItem.lyr.objLyr.styObj.left = null;
		dItem.lyr.objLyr.styObj.top = null;
			
	}
      }
    }
    return false
}

function initDragMouseEvents() {

    getDisplayDocument().onmousedown = dragMouseDown
    getDisplayDocument().onmousemove = dragMouseMove
    getDisplayDocument().onmouseup = dragMouseUp
	if (is.ns) getDisplayDocument().captureEvents(Event.MOUSEDOWN | Event.MOUSEMOVE | Event.MOUSEUP)
	
	if( getDisplayDocument().body.addEventListener )
	{
		var totalDragItems = dragMgr.arrDragItems.length;
				
		for (var i = 0; i < totalDragItems; i++)
		{
			var elem = dragMgr.arrDragItems[i].lyr.objLyr.ele;
			elem.addEventListener("touchstart", function(event){
				event = event || getDisplayWindow().event;
				DragMouseDown.apply(dragMgr, [event.changedTouches[0].pageX, event.changedTouches[0].pageY, event]);    
			});
			
			elem.addEventListener("touchmove", function(event){
				event = event || getDisplayWindow().event;
				event.preventDefault();  	
				DragMouseMove.apply(dragMgr, [event.changedTouches[0].pageX, event.changedTouches[0].pageY]);    
			});
			
			elem.addEventListener("touchend", function(event){
				DragMouseUp.apply(dragMgr);    
			});		
		}
	}
}

function dragMouseDown(e) {
	if (!e)
        e = getDisplayWindow().event;
    if ((is.ns && e.which!=1) || (is.ie && event.button!=1)) return true
    var A = getAdjXY(e);
    if (dragMgr && dragMgr.mouseDown(A.x,A.y,e)) return false
    else return DynMouseDown(A.x,A.y)
}
function dragMouseMove(e) {
	if (!e)
        e = getDisplayWindow().event;
    var A = getAdjXY(e);
    if (dragMgr && dragMgr.mouseMove(A.x,A.y)) return false
    else return DynMouseMove(A.x,A.y)
}
function dragMouseUp(e) {
	if (!e)
        e = getDisplayWindow().event;
    var A = getAdjXY(e);
    if (dragMgr && dragMgr.mouseUp(A.x,A.y)) return false
    else return DynMouseUp(A.x,A.y)
}

function getAdjXY(e) 
{
    var A = getDisplayDocument();
	var B = (!!getDisplayWindow().TouchEvent && e instanceof TouchEvent);
    var C = B ? e.changedTouches[0].pageX : (e.pageX ? e.pageX : (e.x + A.body.scrollLeft));
    var D = B ? e.changedTouches[0].pageY : (e.pageY ? e.pageY : (e.y + A.body.scrollTop));
    return {
        x: C,
        y: D
    };
}


// overwrite these functions in your html source to do other mouse handling
function DynMouseDown(x,y) {return true}
function DynMouseMove(x,y) {return true}
function DynMouseUp(x,y) {return true}

// automatically define the default "drag" Drag Object
dragMgr = new DragMgr()

{ // Extend prototypes
var inl = ObjInline.prototype
inl.dragId          = 0
inl.dropObj         = null
inl.updateDragFunc  = null

var img = ObjImage.prototype
img.dragId          = 0
img.dropObj         = null
img.updateDragFunc  = null
}