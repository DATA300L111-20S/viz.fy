function init()
{
    console.log('fuck');

    $(window).bind('beforeunload', function(){
    return '>>>>>Before You Go<<<<<<<< \n Your custom message go here';
});
}

console.log('i exist');
window.onload = init();
