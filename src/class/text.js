class Button extends PIXI.extras.BitmapText{
    constructor(text,style){
      super(text,style);
      this.interactive=true;
      this.buttonMode=true;
    }
}

class Phrases{
  constructor(config){
    this.container=new PIXI.Container();
    this.hide();
    this.game=config;
    this.option=[];

    for(let i=0;i<3;i++){
      this.option[i]=new Button("Option",this.game.settings.Text.ButtonStyle);
      this.option[i].game=this.game;
      this.option[i].on('pointertap', this.onTap.bind(this.option[i]));
      this.option[i].index=i;
      this.container.addChild(this.option[i]);
      if(i>0)this.option[i].y=this.option[i-1].y+this.option[i-1].height;
    }
  }

  show(){
    this.sort();
    this.container.visible=true;
  }

  hide(){
    this.container.visible=false;
  }

  onTap(){
    let activeChoice=this.game.activeDialogue.currentBranch.Choices;

    if(this.alpha==1){
      this.game.activeDialogue.choice=this.index;
      activeChoice[this.index].clicked=true;
      this.game.activeDialogue.next();
    }
  }

  get(){
    this.clear();
    let options=this.game.activeDialogue.currentBranch.Choices;
    for(let i=0;i<options.length;i++){
      if(options[i].clicked && options[i].Repeat==false){
        this.option[i].alpha=0.5;
      }else this.option[i].alpha=1;
      this.option[i].visible=true;
      this.option[i].text=options[i].Text[this.game.activeLanguage];
    }
    this.show();
  }

  clear(){
    for(let i=0;i<this.option.length;i++){
      this.option[i].visible=false;
    }
  }

  sort(){
    for(let i=0;i<this.option.length;i++){
      this.option[i].anchor.set(0.5,0);
      this.option[i].x=this.game.width/2;
    }
    if(this.container.width>this.container.parent.width || this.container.height>this.container.parent.height){
      this.scale();
    }
  }

  scale(){
    let ratio = Math.min( this.container.parent.width/this.container.width,  this.container.parent.height/this.container.height);
    this.container.scale.set(ratio*0.95);
    this.container.x=this.container.width;
  }
}

class TextField{
  constructor(){
    this.container=new PIXI.Container();
    this.Background=null;
    this.Text=null;
    this.container.visible=false;
  }

  build(){
    this.container.parentLayer = this.game.layerUI;
    this.Background=new PIXI.Sprite(PIXI.Texture.WHITE);

    let size=4;
    if(this.game.settings.Text.Size!==undefined){
      if(this.game.settings.Text.Size==="fourth") size=4;
      else if(this.game.settings.Text.Size==="half") size=2;
    }
    this.Background.width=this.game.width;
    this.Background.height=this.game.height/size;

    this.Background.tint='black';
    this.Background.alpha=0.5;

    this.Text=new Button("", this.game.settings.Text.Style);
    this.Text.anchor.set(0.5,0);
    this.Text.x=this.game.width/2;
    this.Text.y=0;
    this.Text.on('pointertap',this.skip.bind(this));

    this.Choices=new Phrases(this.game);

    this.container.addChild(this.Background);
    this.container.addChild(this.Text);
    this.container.addChild(this.Choices.container);

    if(this.game.settings.Text.Position!==undefined) this.setPosition(this.game.settings.Text.Position);
  }

  show(){
    this.Text.visible=true;
    this.container.visible=true;
  }

  hide(){
    this.container.visible=false;
  }

  end(){
    if(this.game.activeDialogue!==null){
      this.talker.shutup();
      if(this.game.activeDialogue.choice!==null) this.game.activeDialogue.answer();
      else{
        this.Text.visible=false;
        this.Choices.get();
      }

    }else{
      this.setText("");
      this.hide();
      this.talker.shutup();
      this.game.player.stop();
    }
  }

  skip(){
    this.end();
    if(this.talker) clearTimeout(this.talker.timeoutID);
  }

  setPosition(position){
    if(position==="top"){
      this.container.x=0;
      this.container.y=0;
    }else if(position==="bottom"){
      this.container.x=0;
      this.container.y=this.game.height-this.container.height;
    }
  }

  setText(newText){
    this.Text.text=newText;
    if(this.Text.width>this.container.width || this.Text.height>this.container.height){
      this.adjustText();
    }
  }

  adjustText(){
    let ratio = Math.min( this.container.width/this.Text.width,  this.container.height/this.Text.height);
    this.container.scale.set(ratio*0.95);
  }

  //Get words number of the text
  countWords(str) {
   return str.split(" ").length;
  }

  //Calculate how many seconds we show the text
  timeOut(){
    let time;
    if(this.game.settings.Text.Speed!==undefined) time=this.game.settings.Text.Speed;
    else time=this.countWords(this.Text.text)/3;

    //Time must be at least 1 second
    if(time<1) time=1;

    return time*1000;
  }

  setColor(colour){
    this.Text.tint=colour;
  }
}

export {Button,TextField};
