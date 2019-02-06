"use strict"; (() => {

    function createPoint(id, name = '') {

        let point = document.createElement('div');
        point.className = 'input-point';

        let fieldX = document.createElement('div'),
            fieldY = document.createElement('div'),
            labelX = document.createElement('label'),
            labelY = document.createElement('label'),
            inputX = document.createElement('input'),
            inputY = document.createElement('input');

        fieldX.className = fieldY.className = 'input-field';

        labelX.innerHTML = 'X<sub>' + id + '</sub>';
        labelY.innerHTML = 'Y<sub>' + id + '</sub>';

        inputX.type = inputY.type = 'text';
        inputX.max = inputY.max = Number.MAX_SAFE_INTEGER;
        inputX.min = inputY.min = Number.MIN_SAFE_INTEGER;
        inputX.value = Math.floor(Math.random() * (1000 + 1000) - 1000);
        inputY.value = Math.floor(Math.random() * (1000 + 1000) - 1000);

        inputX.name = name + 'x[]';
        inputY.name = name + 'y[]';

        fieldX.appendChild(labelX);
        fieldY.appendChild(labelY);
        fieldX.appendChild(inputX);
        fieldY.appendChild(inputY);

        point.appendChild(fieldX);
        point.appendChild(fieldY);

        return point;

    }

    function createError(html) {
        let error = document.createElement('div');
        error.className = 'error';
        error.innerHTML = html;
        return error;
    }

    function validateNumber(number, label) {
        let errors = [];
        if (!number.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/)) {
            errors.push('Невірне значення ' + label + '!');
        } else {
            let value = Number.parseFloat(number);
            if (value < Number.MIN_SAFE_INTEGER || value > Number.MAX_SAFE_INTEGER) {
                errors.push('Значення ' + label + ' виходить за міжі!');
            }
        }
        return errors;
    }

    function lengthToLine(line, point) {
        return Math.abs((line[0].y - line[1].y) * point.x + (line[1].x - line[0].y) * point.y + line[0].x * line[1].y - line[1].x * line[0].y) / Math.sqrt(Math.pow(line[1].x - line[0].x, 2) + Math.pow(line[1].y - line[0].y, 2))
    }

    function textPoints(points) {
        let p = [];
        points.forEach((point) => {
            p.push('(' + point.x + '; ' + point.y + ')');
        });
        return p.join(', ')
    }
    
    document.addEventListener('DOMContentLoaded', () => {

        // get basic element links
        let InputLine = document.getElementById('input-line'),
            Points    = document.getElementById('points'),
            AddPoint  = document.getElementById('add-point'),
            DelPoint  = document.getElementById('del-point'),
            Errors    = document.getElementById('errors'),
            Result    = document.getElementById('result'),
            MainForm  = document.getElementById('main');

        // prepare form input point

        InputLine.appendChild(createPoint("L" + 1, 'l'));
        InputLine.appendChild(createPoint("L" + 2, 'l'));

        Points.appendChild(createPoint(1));

        // set add and del element handles

        AddPoint.addEventListener('click', () => {
            Errors.innerHTML = '';
            if (Points.childElementCount == 100/*Number.MAX_SAFE_INTEGER*/) {
                Errors.appendChild(createError('Перевищено ліміт кількості точок!'));
            } else {
                Points.appendChild(createPoint(Points.childElementCount + 1));
            }
        });

        DelPoint.addEventListener('click', () => {
            Errors.innerHTML = '';
            if (Points.childElementCount == 1) {
                Errors.appendChild(createError('Точок для оцінки не може бути менше ніж одна!'));
                return;
            }
            Points.removeChild(Points.lastElementChild);
        });

        // set hide result
        Result.getElementsByClassName('ctrl-hide')[0].addEventListener('click', () => {
            Result.classList.toggle('hide')
        });

        // set basic form handel

        MainForm.addEventListener('submit', () => {
            Errors.innerHTML = '';

            let line = [], points = [], is_correct = true;

            // get point element links

            let lx = MainForm.elements['lx[]'],
                ly = MainForm.elements['ly[]'],
                px = MainForm.elements['x[]'],
                py = MainForm.elements['y[]'];

            // validate form values and get values to arrays

            for (let i = 0; i < 2; i++) {
                validateNumber(lx[i].value, 'координата X<sub>L' + (i + 1) + '</sub> точки прямої').forEach((error) => {
                    Errors.appendChild(createError(error));
                    is_correct = false;
                });

                validateNumber(ly[i].value, 'координата Y<sub>L' + (i + 1) + '</sub> точки прямої').forEach((error) => {
                    Errors.appendChild(createError(error));
                    is_correct = false;
                });

                line[i] = {'x': Number.parseFloat(lx[i].value), 'y': Number.parseFloat(ly[i].value)};
            }

            if (line[0].x == line[1].x && line[0].y == line[1].y) {
                Errors.appendChild(createError('Неможливо побутувати пряму за заданими координатами!'));
                is_correct = false;
            }

            if (px.length === undefined) {

                validateNumber(px.value, 'координата X<sub>L1</sub> точки').forEach((error) => {
                    Errors.appendChild(createError(error));
                    is_correct = false;
                });
                validateNumber(py.value, 'координата Y<sub>L1</sub> точки').forEach((error) => {
                    Errors.appendChild(createError(error));
                    is_correct = false;
                });
                points.push({'x': Number.parseFloat(px.value), 'y': Number.parseFloat(py.value)});

            } else {

                for (let i = 0; i < px.length; i++) {
                    validateNumber(px[i].value, 'координата X<sub>L' + (i + 1) + '</sub> точки').forEach((error) => {
                        Errors.appendChild(createError(error));
                        is_correct = false;
                    });
                    validateNumber(py[i].value, 'координата Y<sub>L' + (i + 1) + '</sub> точки').forEach((error) => {
                        Errors.appendChild(createError(error));
                        is_correct = false;
                    });
                    points.push({'x': parseFloat(px[i].value), 'y': parseFloat(py[i].value)});
                }

            }

            if (is_correct) {

                let maxPoints = [], minPoints = [], minLength = 0, maxLength = 0;

                minLength = maxLength = lengthToLine(line, points[0]);

                points.forEach((point) => {
                    let length = lengthToLine(line, point);
                    if (length < minLength) {
                        minPoints = [point];
                        minLength = length;
                    } else if (length > maxLength) {
                        maxPoints = [point];
                        maxLength = length;
                    } else if (length == minLength) {
                        minPoints.push(point);
                    } else if (length == maxLength) {
                        maxPoints.push(point);
                    }
                });

                Result.classList.toggle('hide');

                Result.getElementsByClassName('min').item(0).innerText = "Мінімальна довжина від прямої дорівнює " + minLength + ". Точка(и) " + textPoints(minPoints) + " знаходяться на мінімальній довжині від прямої!";

                Result.getElementsByClassName('max').item(0).innerText = "Максимальна довжина від прямої дорівнює " + maxLength + ". Точка(и) " + textPoints(maxPoints) + " знаходяться на максимальній довжині від прямої!";

            }

        });

    });

})();