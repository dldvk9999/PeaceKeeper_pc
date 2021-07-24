import json
import asyncio
import websockets
import re
import auto_classify
import cussword_classify
from tensorflow.keras.models import load_model

modelName = 'TRAIN_MODEL_5.h5'
model_ = load_model(modelName)
Sensitivity = 3  # 높을수록 'pos' 값도 'neg' 로 인식, default:3

space_match = re.compile(r'[ ]+')
number_math = re.compile(r'[0-9]+')


def printThread(msg, avg):
    print(avg, msg)


async def thread(websocket, recvList):
    loop = asyncio.get_running_loop()
    for text in recvList:
        if space_match.match(text) or text == "" or number_math.match(text) or text is None:
            continue

        avg, result = auto_classify.init(text, model_)
        if avg == "nan":
            avg = 0.0
        FLAG, result = cussword_classify.neg_pos_word_classifier(avg, result, Sensitivity)

        if FLAG:
            await loop.run_in_executor(None, printThread, text, avg)
        if FLAG:
            await websocket.send(result)


async def accept(websocket, path):
    global Sensitivity
    print("Server connect Success! path : " + path)
    await websocket.send("Server connect Success!")
    while True:
        # noinspection PyBroadException
        try:
            recv_list = await websocket.recv()
        except Exception:
            print("Extension Socket Closed.")
            break
        recv_list = json.loads(recv_list)
        try:
            recv_string_list = recv_list[0]
            Sensitivity = recv_list[1]
        except TypeError:
            recv_string_list = str(recv_list)

        print("list length:", len(recv_string_list), "/ sensitivity:", Sensitivity)
        if type(Sensitivity) is str:
            Sensitivity = int(Sensitivity)

        if len(recv_string_list) > 20:
            aws = []
            for i in range(21):
                # print(len(recv_string_list) // 10 * i, len(recv_string_list) // 10 * (i + 1) - 1)
                if len(recv_string_list) // 20 * (i + 1) > len(recv_string_list):
                    aws.append(asyncio.ensure_future(thread(websocket,
                                                            recv_string_list[len(recv_string_list) // 20 * i:len(
                                                                recv_string_list)])))
                else:
                    aws.append(asyncio.ensure_future(thread(websocket,
                                                            recv_string_list[len(recv_string_list) // 20 * i:len(
                                                                recv_string_list) // 20 * (i + 1)])))
            await asyncio.gather(*aws)
        else:
            await thread(websocket, recv_string_list)


start_server = websockets.serve(accept, "localhost", 9998)
asyncio.get_event_loop().run_until_complete(start_server)
print("Server Wait ...")
asyncio.get_event_loop().run_forever()
