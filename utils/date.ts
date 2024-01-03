export function formatDate(date: Date) {
    // Extracting individual date components
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
  
    // Creating the formatted date string
    let formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}

export function formatDateHour(startTimeString: any) {
    const date = new Date(startTimeString);
    // Extracting individual date components
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
  
    // Creating the formatted date string
    let formattedDate = `${hours}:${minutes}:${seconds}`;
    return formattedDate;
}