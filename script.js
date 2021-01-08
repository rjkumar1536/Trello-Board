let root = document.getElementById("root");
let storage = [];
let dragged = null;
class trelloList{
    constructor({id, place, cards = [], title = "trello list", save = true} = {}){

        this.place = place;
        this.id = id;
        this.title = title;
        this.cardArray = cards;

        this.render(save);
    }

    addTrello(){
        let text = this.input.value;
        let place = this.div;
        let trelloList = this;
        let id = create_UUID();
        let obj = {
            id,
            text,
            place,
            trelloList
        }
        this.cardArray.push(new Card(obj));
    }


    render(save){
        this.createTrelloListElement(save);
        this.place.append(this.trelloListElement);
        for(let card of this.cardArray){
            let text = card.value;
            let place = this.div;
            let trelloList = this;
            let id = card.id;
            let obj = {
                id,
                text,
                place,
                trelloList,
                save
            }
            new Card(obj);
        }
    }

    handleCllickAndEnter(){
        if(this.input.value != ""){
            this.addTrello.call(this);
            this.input.value = "";
        }
    }
    deleteList(){
        this.trelloListElement.remove();
        removeTrelloListElementFromTrelloStorage(this.id);
    }
    createTrelloListElement(save){
        //Create elements
        this.header = document.createElement('div');
        this.header.classList.add('trello-header')
        this.h2 = document.createElement('h2');
        this.h2.innerText = this.title;
        this.deleteButton = document.createElement('button');
        this.deleteButton.innerText = "X";
        this.deleteButton.classList.add("delete-trello")
        this.input = document.createElement('input');
        this.input.classList.add("comment");
        this.button = document.createElement('button');
        this.button.innerText = 'Add';
        this.button.classList.add("btn-save");
        this.button.id = "trello-list-button";


        this.div = document.createElement('div');
        this.trelloListElement = document.createElement('div');

        this.header.append(this.h2);
        this.header.append(this.deleteButton);
        
        this.deleteButton.addEventListener('click', ()=>{
            this.deleteList.call(this);
        });

        //Add Event listener
        this.button.addEventListener('click', ()=>{
            this.handleCllickAndEnter.call(this)
        });

        this.input.addEventListener('keydown', (e)=>{
            if(e.keyCode == 13){
                this.handleCllickAndEnter.call(this)
            }
        })

        //Append elements to the to-do list element
        this.trelloListElement.append(this.header);
        this.trelloListElement.append(this.input);
        this.trelloListElement.append(this.button);
        this.trelloListElement.append(this.div);
        this.trelloListElement.classList.add("trelloList");
        this.trelloListElement.addEventListener('dragover', (e)=>{
            e.preventDefault();
        });

        this.trelloListElement.addEventListener('dragenter', (e)=>{
            e.preventDefault();
            this.trelloListElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
        });

        this.trelloListElement.addEventListener('dragleave', ()=>{
            this.trelloListElement.style.backgroundColor = 'rgb(235, 235, 235)';
        })
        this.trelloListElement.addEventListener('drop', ()=>{
            let text = dragged.text;
            let place = this.div;
            let trelloList = this;
            let id = create_UUID();
            let obj = {
                id,
                text,
                place,
                trelloList
            }
            new Card(obj);
            dragged.deleteCard();
            this.trelloListElement.style.backgroundColor = 'rgb(235, 235, 235)';
        })
        this.trelloListElement.id = this.id;

        let id = this.id
        let value = this.title;
        let cards = []
        let obj = {
            id,
            value ,
            cards
        }
        if(save)
        addTrelloListElementToTrelloStorage(obj);
    }
}


class Card{
    constructor({id, text, place, trelloList, save = true} = {}){

        this.id = id;
        this.place = place;
        this.trelloList = trelloList;
        this.text = text;
        this.render(save);
    }

    render(save){
        this.card = document.createElement('div');
        this.card.classList.add("card");
        this.card.setAttribute("draggable", true);

        this.card.addEventListener('dragstart', ()=>{
            dragged = this;
            setTimeout(()=> {
                this.card.style.display = 'none';
            },0)
        });

        this.card.addEventListener('dragend', ()=>{
            setTimeout(()=>{
                this.card.style.display = 'flex';
                dragged = null;
            },0)
        });
        this.card.id = this.id;

        this.p = document.createElement('p');
        this.p.innerText = this.text;

        this.deleteButton = document.createElement('button');
        this.deleteButton.innerText = "X";
        this.deleteButton.addEventListener('click', ()=>{
            this.deleteCard.call(this);
        });

        this.card.append(this.p);
        this.card.append(this.deleteButton);
        
        this.place.append(this.card);

        let id = this.id;
        let value = this.text;
        let trelloId = this.trelloList.id;
        let card = { id, value}
        let trello = {id : trelloId}
        if(save)
        addCardToTrelloListStorage(card, trello);
    }

    deleteCard(){
        this.card.remove();
        let id = this.id;
        let i = this.trelloList.cardArray.indexOf(this);
        this.trelloList.cardArray.splice(i,1);
        removeCardFromTrelloListStorage(this.id, this.trelloList.id);
    }
}



function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function handleClickAndEnter(){
    if ( addTrelloListInput.value.trim() != ""){
        let title = addTrelloListInput.value;
        let id = create_UUID();
        let obj = {
            id,
            place : root,
            title
        }
        new trelloList(obj);
        addTrelloListInput.value = "";
    }
}

function getLocalStorageData(){
    let data =  JSON.parse(localStorage.getItem("trelloList"));
    return data;
}

function setLocalStorageData(){
    localStorage.setItem("trelloList", JSON.stringify(storage));
}

function addCardToTrelloListStorage(card, trello){
    let index = storage.findIndex((data) => data.id == trello.id);
    let cards = storage[index].cards;
    let updatedCards = [...cards, card];
    storage[index].cards = updatedCards;
    setLocalStorageData();
}

function removeCardFromTrelloListStorage(cardId, trelloId){
    let index = storage.findIndex((data) => data.id == trelloId);
    let cards = storage[index].cards;
    let cardIndex = cards.findIndex((trelloCard) => trelloCard.id == cardId)
    cards.splice(cardIndex , 1);
    storage[index].cards = cards;
    setLocalStorageData();
}

function addTrelloListElementToTrelloStorage(trello){
    storage.push(trello);
    setLocalStorageData();
}

function removeTrelloListElementFromTrelloStorage(trelloId){
    let index = storage.findIndex((data) => data.id == trelloId);
    storage.splice(index, 1);
    setLocalStorageData();
}

function loadData(){
    let data  = getLocalStorageData();
    if(data){
        storage = [...data];
        for(let list of data){
            let title = list.value;
            let id = list.id;
            let cards = list.cards;
            let save = false;
            let obj = {
                id, 
                place : root,
                cards,
                title,
                save 
            }
            new trelloList(obj);
        }
    }
}

let addTrelloListInput = document.getElementById("addTrelloListInput");
let addTrelloListButton = document.getElementById("addTrelloListButton");

addTrelloListInput.addEventListener('keydown', (e)=>{
    if(e.keyCode == 13){
        handleClickAndEnter();
    }
})
addTrelloListButton.addEventListener('click',()=>{
   handleClickAndEnter();
});

loadData();



