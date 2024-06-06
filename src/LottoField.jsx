import { useState } from 'react';
import styles from './LottoField.module.css';
import PropTypes from 'prop-types';

const LottoField = ({ onSelectNumber, numbers }) => {
    const [selectedNumbers, setSelectedNumbers] = useState([]);

    const handleClick = (number) => {
        onSelectNumber(number);

        setSelectedNumbers((prevSelectedNumbers) => {
            const isSelected = prevSelectedNumbers.includes(number);
            if (!isSelected) {
                return [...prevSelectedNumbers, number];
            } else {
                return prevSelectedNumbers.filter((n) => n !== number);
            }
        });
    };

    return (
        <div className={styles.field}>
            {numbers.map((number, index) => (
                <button
                    className={styles.button}
                    key={index}
                    onClick={() => handleClick(number)}
                    style={{
                        backgroundColor: selectedNumbers.includes(number) ? '#FFD205' : '#ffffff',
                    }}>
                    {number}
                </button>
            ))}
        </div>
    );
};

LottoField.propTypes = {
    onSelectNumber: PropTypes.func.isRequired, 
    numbers: PropTypes.arrayOf(PropTypes.number).isRequired, 
};

export default LottoField;
