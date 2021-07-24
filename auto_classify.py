import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np
import re


def init(text, model):
    _data = re.sub('[-=+,#/?:^$.@*\"※~&%ㆍ!』‘|()\[\]<>`\'…》♡]', '', text)

    tokenizer = Tokenizer(num_words=50)
    tokenizer.fit_on_texts(_data)
    query = tokenizer.texts_to_sequences(_data)
    query = pad_sequences(query, maxlen=50)

    prediction = np.argmax(model.predict_on_batch(query), axis=-1)
    avg = round(float(np.mean(prediction)), 5)
    return avg, text
    # limit : 0.64
    # 낮으면 낮을수록 좋은 말.
