function fetchJsonDataSync(url) {
    const syncRequest = new XMLHttpRequest();
    syncRequest.open("GET", url, false); //function to get synchronous
    syncRequest.send();

    if (syncRequest.status === 200) {
        return JSON.parse(syncRequest.responseText);
    }
}


function fetchJsonDataAsync(url, callback) {
    const asyncRequest = new XMLHttpRequest();
    asyncRequest.open("GET", url, true); // function to get asynchronous
    asyncRequest.onload = () => {
        if (asyncRequest.status === 200) {
            callback(null, JSON.parse(asyncRequest.responseText));
        }
    };
    asyncRequest.send(); //sent request
}

async function fetchJsonData(url) {
    const response = await fetch(url); //function for fetch
    return await response.json();
}

function displayData(studentData) {
    const studentTableBody = document.getElementById('student-data');
    studentTableBody.innerHTML = '';

    studentData.forEach(student => {
        const studentRow = `
            <tr>
                <td>${student.id}</td>
                <td>${student.firstName}</td>
                <td>${student.surname}</td>
            </tr>
        `;
        studentTableBody.innerHTML += studentRow; //structure taken from last weeks lab
    });
}

async function processData(data) {
    return data.data.map(student => {
        const [firstName, ...lastNameParts] = student.name.split(' ');
        const surname = lastNameParts.join(' ');
        return {
            id: student.id,
            firstName: firstName,
            surname: surname,
        };
    }); //proccessing of the student data.
}

document.getElementById('SyncBtn').onclick = function() {
    try {
        const referenceData = fetchJsonDataSync('data/reference.json');
        const data1File = referenceData.data_location;
        const data1 = fetchJsonDataSync(`data/${data1File}`);

        processData(data1).then(processedData1 => {
            if (!Array.isArray(processedData1)) {
                return;
            } //simple if to ensure te data is in an array.

            const data2File = data1.data_location;
            const data2 = fetchJsonDataSync(`data/${data2File}`);
            processData(data2).then(processedData2 => {
                const data3 = fetchJsonDataSync('data/data3.json');
                processData(data3).then(processedData3 => {
                    const combinedData = [...processedData1, ...processedData2, ...processedData3];
                    displayData(combinedData);
                });
            });
        });
    } catch (error) {
        console.error("Error with data:", error);
    }
};

document.getElementById('AsyncBtn').onclick = function() {
    fetchJsonDataAsync('data/reference.json', (error, referenceData) => {
        if (error) {
            return;
        }

        if (referenceData && referenceData.data_location) {
            const data1File = referenceData.data_location;
            fetchJsonDataAsync(`data/${data1File}`, (error, data1) => {
                if (error) {
                    return;
                }

                processData(data1).then(processedData1 => {
                    if (!Array.isArray(processedData1)) {
                        return;
                    } //same structure as synchronous 

                    const data2File = data1.data_location;
                    fetchJsonDataAsync(`data/${data2File}`, (error, data2) => {
                        if (error) {
                            return;
                        }

                        processData(data2).then(processedData2 => {
                            fetchJsonDataAsync('data/data3.json', (error, data3) => {
                                if (error) {
                                    return;
                                }

                                processData(data3).then(processedData3 => {
                                    const combinedData = [...processedData1, ...processedData2, ...processedData3];
                                    displayData(combinedData);
                                });
                            });
                        });
                    });
                });
            });
        } 
    });
};

document.getElementById('fetchBtn').onclick = async function() {
    try {
        const referenceData = await fetchJsonData('data/reference.json');
        if (referenceData && referenceData.data_location) {
            const data1File = referenceData.data_location;
            const data1 = await fetchJsonData(`data/${data1File}`);

            const processedData1 = await processData(data1);

            const data2File = data1.data_location;
            const data2 = await fetchJsonData(`data/${data2File}`);
            const processedData2 = await processData(data2);
            const data3 = await fetchJsonData('data/data3.json');
            const processedData3 = await processData(data3);

            const combinedData = [...processedData1, ...processedData2, ...processedData3];
            displayData(combinedData);
        } 
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};
