import { useState } from 'react';
import LottoField from './LottoField';
import styles from './App.module.css';

import right from './assets/right.mp3';
import wrong from './assets/wrong.mp3';
import img from './assets/trump.gif';

function App() {
    const [firstFieldNumbers, setFirstFieldNumbers] = useState([]);
    const [secondFieldNumber, setSecondFieldNumber] = useState([]);
    const [win, setWin] = useState(false);
    const [shuffledNumbersFirstField, setShuffledNumbersFirstField] = useState([]);
    const [shuffledNumbersSecondField, setShuffledNumbersSecondField] = useState([]);

    const playSound = (sound) => {
        const audio = new Audio(sound);
        audio.play();
    };

    //   функция выбора числа
    const selectNumber = (field, number) => {
        let newNumbers;

        if (field === 'first') {
            newNumbers = firstFieldNumbers.includes(number)
                ? firstFieldNumbers.filter((n) => n !== number)
                : [...firstFieldNumbers, number];
        } else if (field === 'second') {
            newNumbers = secondFieldNumber.includes(number)
                ? secondFieldNumber.filter((n) => n !== number)
                : [...secondFieldNumber, number];
        }

        if (field === 'first') {
            setFirstFieldNumbers(newNumbers);
        } else if (field === 'second') {
            setSecondFieldNumber(newNumbers);
        }
    };

    // перемешивание массива по алгоритму Fisher-Yates
    const shuffle = (array) => {
        const sortedArr = [...array];
        for (let i = sortedArr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [sortedArr[i], sortedArr[j]] = [sortedArr[j], sortedArr[i]];
        }
        return sortedArr;
    };

    // генерация случайных чисел для проверки выигрыша
    const generateRandomNumbers = () => {
        let fullArray = Array(18)
            .fill()
            .map((_, i) => i + 1);

        fullArray = shuffle(fullArray);

        const firstField = fullArray.slice(0, 8);

        const secondField = [Math.floor(Math.random() * 2) + 1];

        console.log('firstR', firstField, 'secondR', secondField);

        return { firstField, secondField };
    };

    // генерация нового билета с перемешанными числами

    const mixNumbers = () => {
        const mixedFirstField = shuffle(Array.from({ length: 19 }, (_, i) => i + 1));
        const mixedSecondField = shuffle(Array.from({ length: 2 }, (_, i) => i + 1));

        setShuffledNumbersFirstField(mixedFirstField);
        setShuffledNumbersSecondField(mixedSecondField);
    };

    // обработка клика на кнопку "Показать результат"
    const checkWinningAndSubmit = async () => {
        checkWinning();
        await sendSelectedNumbers();
    };
    // проверка выигрыша
    const checkWinning = () => {
        if (firstFieldNumbers.length !== 8 || secondFieldNumber.length !== 1) {
            alert('Выберите 8 чисел в первом поле и 1 число во втором поле');
            return;
        }

        const generatedNumbers = generateRandomNumbers();
        const matchCountFirstField = firstFieldNumbers.filter((number) =>
            generatedNumbers.firstField.includes(number),
        ).length;
        const matchCountSecondField = secondFieldNumber.includes(generatedNumbers.secondField[0])
            ? 1
            : 0;

        if (
            matchCountFirstField >= 4 ||
            (matchCountFirstField >= 3 && matchCountSecondField === 1)
        ) {
            setWin(true);
            playSound(right);
        } else {
            playSound(wrong);
            alert('Вы не выиграли. Попробуйте еще раз!');
        }
    };

    // отправка результата на сервер
    const sendSelectedNumbers = async (retryCount = 0) => {
        try {
            const response = await fetch('https://lotto777.com/api/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedNumber: {
                        firstField: firstFieldNumbers,
                        secondField: secondFieldNumber,
                    },
                    isTicketWon: win,
                }),
            });

            if (!response.ok) {
                if (retryCount < 2) {
                    setTimeout(() => {
                        sendSelectedNumbers(retryCount + 1);
                    }, 2000);
                } else {
                    console.error('Все попытки отправки данных завершены без успеха.');
                }
            } else {
                console.log('Данные успешно отправлены.');
            }
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.ticket}>
                <h1 className={styles.title}>Билет 1</h1>
                {win ? (<>
                    <h2 className={styles.subtitle}>Ого, вы выиграли! Поздравляем!</h2>
                    <img src={img} alt="victory dance" width={250} height={150} />
                    </>
                ) : (
                    <>
                        <h2 className={styles.subtitle}>
                            Поле 1 <span className={styles.span}>Отметьте 8 чисел.</span>
                        </h2>
                        <LottoField
                            onSelectNumber={(number) => selectNumber('first', number)}
                            numbers={
                                shuffledNumbersFirstField.length > 0
                                    ? shuffledNumbersFirstField
                                    : Array.from({ length: 19 }, (_, i) => i + 1)
                            }
                        />
                        <h2 className={styles.subtitle}>
                            Поле 2 <span className={styles.span}>Отметьте 1 число.</span>
                        </h2>
                        <LottoField
                            onSelectNumber={(number) => selectNumber('second', number)}
                            numbers={
                                shuffledNumbersSecondField.length > 0
                                    ? shuffledNumbersSecondField
                                    : Array.from({ length: 2 }, (_, i) => i + 1)
                            }
                        />
                        <button className={styles.button} onClick={checkWinningAndSubmit}>
                            Показать результат
                        </button>
                        <button className={styles.button} onClick={mixNumbers}>
                            Сгенерировать новый билет
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default App;
