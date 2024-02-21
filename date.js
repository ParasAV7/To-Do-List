exports.getDate = function() {
const day = new Date();
const options = {
    day:"numeric",
    week:"narrow",
    month:"long"
}
const today = day.toLocaleDateString("en-us",options);
return today;
}