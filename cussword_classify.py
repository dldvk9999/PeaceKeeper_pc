from cussList import cussList
from cheeringList import cheeringList


def neg_pos_word_classifier(avg, text, Sensitivity):
    FLAG = False
    if Sensitivity == 1:
        limit = 0.35
    elif Sensitivity == 2:
        limit = 0.5
    elif Sensitivity == 3:
        limit = 0.64
    elif Sensitivity == 4:
        limit = 0.7
    else:
        limit = 0.75

    # neg -> pos 로 바꿈.
    if avg <= limit:
        for i in range(len(cheeringList)):
            if cheeringList[i] in text:
                FLAG = False
        for i in range(len(cussList)):
            if cussList[i] in text:
                FLAG = True

    # pos -> neg 로 바꿈.
    else:
        for i in range(len(cussList)):
            if cussList[i] in text:
                FLAG = True

    return FLAG, text
