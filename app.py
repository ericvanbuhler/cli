import cv2
import time 
import numpy as np
import edgeIQ as edge

def main():

    # loop detecture
    while True:
        frame = vs.read()
        # Send Imge for inferencing
        #*********************************************************
        # alwaysAI API Call
        # Get Object Predictions and Bounding Boxes
        #*********************************************************
        Boxes, ClassIDs, Confidences, Indexes, start, stop = rod.objects_detect(frame, engine = "DNN", confidence_level = .5)
        print("[INFO] Object Dectection tok {:.5} seconds".format(stop - start))
        print("[INFO] Boxes Data")
        print(Boxes)
        print("[INFO] ClassIDs Data")
        print(ClassIDs)
        print("[INFO] Confidence Data")
        print(Confidences)
        print("[INFO] Indexes Data")
        print(Indexes)
        # Prepare Image for Display
        #*********************************************************
        # alwaysAI API Call
        # Prepare Image for Display with Labels Predictions
        # and Bounding Boxes
        #*********************************************************
        frame = rod.prepare_image(frame, Boxes, Confidences, Indexes)

        # show the output frame
        cv2.imshow("Webcam", frame)
        key = cv2.waitKey(1) & 0xFF

        # if the `q` key was pressed, break from the loop
        if key == ord("q"):
            break

        print("[INFO] Updating FPD Counter")
        #*********************************************************
        # alwaysAI API Call
        # update Counter
        #*********************************************************
        fps.update()
    # stop the counter and display FPS information
    print("[INFO] Stopping Counter and Diplaying FPS Information")
    #*********************************************************
    # alwaysAI API Call
    # Stop Counter
    #*********************************************************
    fps.stop()
    print("[INFO] elapsed time: {:.2f}".format(fps.elapsed()))
    print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))

    print("[INFO] Program Ending")
    # Close all OpenCV windows before exiting
    if NCS1_ON == True:
        rod.NCS1_Shutdown()
    cv2.destroyAllWindows()
    print("[INFO] Stopping Webcam Video Stream ")
    #*********************************************************
    # alwaysAI API Call
    # Stop Webcam VideoS tream
    #*********************************************************
    vs.stop()




if __name__ == "__main__":

    print("[INFO] Initialize Lists For Bounding Boxes, Confidence Level and Class ID's and Indexes")
    Boxes = []
    ClassIDs = []
    Confidences = []
    Indexes = []
    # Instantiate Classification Object
    print("[INFO] Instantiate alwaysAI Object Detection")
    #*********************************************************
    # alwaysAI API Call
    # Instantiate Object Detection
    #*********************************************************
    rod = edge.Object_Detection("MobileNetSSD")

    # Set Machine Learning Network and Retrieve Image Demensions
    # print("[INFO] Set Deep Learning Network Variable")
    #*********************************************************
    # alwaysAI API Call
    # Set Deep Learning Network Type
    #*********************************************************
    # rod.set_model()

    # Load Machine Learning Model
    print("[INFO] Load Deep Learning Network")
    #*********************************************************
    # alwaysAI API Call
    # Load Deep Learning Framework
    #*********************************************************
    NCS1_ON = rod.load(engine = "DNN")

    # Load class labels used to label predictions
    print("[INFO] Load Class Labels and Set Colors for Bounding Boxes")
    #*********************************************************
    # alwaysAI API Call
    # Load Class Lables and Set Colors for Bounding Boxes
    #*********************************************************
    labels = rod.class_labels()
    print("[INFO] Label Information")

    # Start webcam
    #*********************************************************
    # alwaysAI API Call
    # Start Webcam
    #*********************************************************
    vs = edge.WebcamVideoStream(cam = 0).start()
    # Allow Webcam to warm up
    time.sleep(2.0)
    # Start FPS counter
    #*********************************************************
    # alwaysAI API Call
    # Start FPS counter
    #*********************************************************
    fps = edge.FPS().start()

    main()
