// import modules
const express = require("express");
const bodyParser = require("body-parser");
const http = require("https");

// App initialisation
const app = express();

app.use(express.static("public")); // express.static("public") permet d'utiliser les fichiers css !

app.use(bodyParser.urlencoded({
    extended: true
}));

// Envoyer html à la page d'accueil
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/newsletter.html")
})

// Récupérer user-input
app.post("/", function (req, res) {
    // const qui récupère les infos rentrées par l'utilisateur
    const firstName = req.body.fn;
    const lastName = req.body.ln;
    const mail = req.body.mail;

    console.log(firstName, lastName, mail);

    // on "transforme" ces infos en objet JS (utilisation des {}) l'objet contient un élément qui est un array (lui-même contenant un objet js {})
    const data = {
        members: [{
            email_address: mail,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName
            }
        }]
    };

    const jsonData = JSON.stringify(data); // transformation de l'objet JS en "string" format pour envoyer au serveur de mailchimp

    const url = "https://us14.api.mailchimp.com/3.0/lists/077441eb63"; //endpoint de l'API de mailchimp + path = lists + identifiant de liste
    // options à donner à la méthode http.request ... 
    const options = {
        method: "POST",
        auth: "Jm:55a3ad12c4153d68cfe621db829bfe90-us14"
    };
    // const qui récupère la réponse de mailchimp ?
    const request = http.request(url, options, function (response) {
        response.on("data", function (data) {
            const datasjs = JSON.parse(data)
            //res.send(datasjs) //was just to obtain the code error path !
            console.log(datasjs)

            // if (datasjs.errors.length!==0) {
            //     // res.write("datasjs.errors length is " + datasjs.errors.length)
            //     // res.write("\nThis is the array: \n" + datasjs.errors)
            //     // console.log(datasjs.errors)
            //     // console.log(datasjs.errors[0].error_code)
            //     // res.send()
            // } else if (datasjs.new_members.length!==0){
            //     // res.write("datasjs.new_member length is " + datasjs.new_members.length)
            //     // res.write("\nThis is the array: \n" + datasjs.new_members)
            //     // console.log(datasjs.new_members)
            //     // res.send(datasjs.new_members)
            // }

            if (response.statusCode === 200) {
                if (datasjs.errors.length !== 0) {
                    res.sendFile(__dirname + "/existing_user.html")
                } else {
                    res.sendFile(__dirname + "/success.html")
                }
            } else {
                res.sendFile(__dirname + "/failure.html")
            }
        }) // fin response.on()
    }); // fin de request = http.request

    // envoie de la requete à mailchimp
    
    request.write(jsonData);
    request.end();


})


//failure case -> redirect !
app.post("/failure", function(req, res) {
    res.redirect("/")
})



// Connexion serveur ?
app.listen(process.env.PORT || 3000, function () { //lie l'app au port 3000 du serveur ?
    console.log("Server is running on port 3000.")
})


// APIs keys
// 55a3ad12c4153d68cfe621db829bfe90-us14
// Audience ID : 077441eb63

// https://my-brand-newsletter.herokuapp.com/