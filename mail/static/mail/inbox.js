document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Adding event listener for Send Email Button
  document.querySelector('#compose-form input[type="submit"]').addEventListener('click', send_email);
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-display').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-display').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetching data for particular inbox
  if ('inbox'.localeCompare(mailbox)==0){

    console.log("In Inbox Function");

    fetch(`/emails/${mailbox}`)
    // Putting response in JSON form
    .then(response => response.json())
    .then(data => {
      data.forEach(obj => {
        //console.log("Test");
        display_email(obj,mailbox);

      })
    })
    .catch(error=> console.error(error));
  }

  // For Sent Box
  if ('sent'.localeCompare(mailbox)==0){

    console.log("In sent Function");

    fetch(`/emails/${mailbox}`)
    // Putting response in JSON form
    .then(response => response.json())
    .then(data => {
      data.forEach(obj => {
        //console.log("Test");
        //console.log(obj);
        display_email(obj,mailbox);
      })
    })
    .catch(error=> console.error(error));
  }

  // For Archieved box
  if ('archive'.localeCompare(mailbox)==0){

    console.log("In archieve Function");

    fetch(`/emails/${mailbox}`)
    // Putting response in JSON form
    .then(response => response.json())
    .then(data => {
      data.forEach(obj => {
        //console.log("Test");
        //console.log(obj);
        display_email(obj,mailbox);
      })
    })
    .catch(error=> console.error(error));
  }
  // Ending of Inbox Fetching Function


}

// Custom Functions

// Function for displaying emails 
function display_email(data,mailbox){

  // Getting Parent view
  var parentVar = document.getElementById("emails-view");

  // Creatinfg individual div child with its contents
  var d = document.createElement("div"); // Parent of every Post
  d.className = "style_email"; // Class of parent

  var subject = document.createElement("h3"); // For Subject
  subject.innerHTML = data.subject;
  subject.className = "style_subject_email";

  var sender = document.createElement("strong"); // For Sender
  sender.innerHTML = data.sender;
  sender.className = "style_sender_email";

  var date = document.createElement("p"); // For Date 
  date.innerHTML = data.timestamp;
  date.className = "style_date_email";

  // Changing displaying details according to mailbox
  if ('sent'.localeCompare(mailbox)==0){
    sender.innerHTML = data.recipients;
  }

  // Creating Div element with clear
  var clear_div = document.createElement("div");
  clear_div.className = "email_clear";

  // Creating an a tag element
  var button = document.createElement("a");
  button.className="Email_btn";
  console.log(mailbox);
  button.href="javascript:show_email("+data.id+","+mailbox+");";

  if('archive'.localeCompare(mailbox)==0){
    button.href="javascript:show_email("+data.id+");";
  }

  // Changing parent div colour based on read bool
  if (data.read == false){
    d.style.backgroundColor= "	#D8D8D8";
  }

  // Appending   
  parentVar.appendChild(button);
  button.appendChild(d);
  d.appendChild(sender);
  d.appendChild(subject);
  d.appendChild(date);
  parentVar.appendChild(clear_div);

//  parentVar.(data.id);
  console.log(data.id);
}

//-------------------------------------------------------------------------------------------//

// Send Mail functionality
function send_email(event){

  event.preventDefault();

  // Gathering all the data 
  const recipients = document.getElementById("compose-recipients").value;
  const subject = document.getElementById("compose-subject").value;
  const body = document.getElementById("compose-body").value; 
// fetching the required address and sending data in json format
  fetch('/emails',{
    method:'POST',
    body: JSON.stringify({
        recipients:recipients,
        subject:subject,
        body:body,
      }),
  })
  .then(response => response.json())
  .then(result => {
    //console.log(result);
    load_mailbox('sent',result);
    })
  // Sending any errorss
  .catch((error) => {console.log(error);});
}

//-------------------------------------------------------------------------------------------//
// Functions for updating data and showing emails

function update_json(id){

  // No updating the data
  fetch(`/emails/${id}`,{
    method:"PUT",
    body:JSON.stringify({
      read:true
    })
  })
  .catch(error=> console.error(error));

  return false;
}

function update_archived(id,bool_status){
  console.log("Button Clicked");
  fetch(`/emails/${id}`,{
    method:"PUT",
    body:JSON.stringify({
      archived:bool_status,
    })
  })
  .catch(error=> console.error(error));
  location.reload();
}

function show_email(id,mailbox){

  // Hiding and displaying the required divs
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-display').style.display = 'block';

  var btn_arch = document.getElementById("archive_btn");

  // Declaring some variables need for Reply Email
  var to;
  var subject;
  var body;
  var time;
  
  // Fetching the required email
  fetch(`/emails/${id}`)
  // Putting response in JSON form
  .then(response => response.json())
  .then(data => {
    console.log(data);
    document.getElementById("email_from").innerHTML=data.sender;
    document.getElementById("email_to").innerHTML=data.recipients;
    document.getElementById("email_subject").innerHTML=data.subject;
    document.getElementById("email_timestamp").innerHTML=data.timestamp;
    document.getElementById("email_message").innerHTML=data.body;

    to = data.recipients;
    subject = data.subject;
    body = data.body;
    time = data.timestamp;

    var x = data.archived;
    if (x){
      btn_arch.innerHTML="Unarchive";
      btn_arch.addEventListener('click',() => {
        update_archived(id,false)});
    }else {
      btn_arch.innerHTML="Archive";
      btn_arch.addEventListener('click',() => {
        update_archived(id,true)});
    }
    console.log(x);
  })
  .catch(error=> console.error(error));

  btn_arch.style.display="block";
  
  // Getting Inner Html
  var n =mailbox.innerHTML;

  if('Inbox'.localeCompare(n)==0){
    update_json(id);
  }
  
  if('Sent'.localeCompare(n)==0){
    btn_arch.style.display="none";
  }

  // Function for show email

  var reply_btn = document.getElementById("reply_btn");
  reply_btn.addEventListener('click',() => {
    // Filling out the necessary stuff
    compose_email();
    // Filling Blanks
    document.getElementById("compose-recipients").value=to;
    
    if(subject.startsWith("RE: ")){
      document.getElementById("compose-subject").value = subject;
    }else{
      document.getElementById("compose-subject").value = "RE: "+subject;
    }
    document.getElementById("compose-body").value = "On "+time+" "+to+" wrote: "+body;
  })
  
}



