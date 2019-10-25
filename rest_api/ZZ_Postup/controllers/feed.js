exports.getPosts = (req, res, next) => {

    // json je express metoda, vrati spravne hlavicky, zkonvertuje js object do json a posle
    // status 200 = success
    res.status(200).json({
        posts: [{
            title: 'titulek',
            content: 'first post'
        }]
    });

}

exports.createPost = (req, res, next) => {
    // create post in db
    const title = req.body.title;
    const content = req.body.content;
    // status 201 succes resource was created
    res.status(201).json({
        message: 'post created sucessfully', 
        id: 123,
        post: title,
        content: content
    })
}