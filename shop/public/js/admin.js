const deleteProduct = (el) => {
    const productId = el.parentNode.querySelector('[name=productId]').value;
    const csrf = el.parentNode.querySelector('[name=_csrf]').value;

    //fetch metoda umoznuje posilat http requesty

    fetch('/admin/product/' + productId, {
            method: 'DELETE',
            // csurf package se pro token diva do body, do query a do headers
            headers: {
                'csrf-token': csrf
            }
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            // pokud server vrati v json odpovedi success tak smaz z DOMu ten produkt
            console.log(myJson.message);
            if (myJson.message === 'success') {
                // closest najde nejblizsi element smerem nahoru k rootu
                el.closest('article').remove();
            }
        })
        .catch(err => console.log(err));
};