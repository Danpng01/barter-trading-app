import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, jsonify, request
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase Admin SDK
cred = credentials.Certificate('./serviceAccountKey.json')  # Path to your service account key
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()


def helper_collate_followers_items(current_user_uid):
    """
    Helper function to collate items from all the current user's followers.
    Returns a list of item IDs owned by followers.
    """
    user_info_doc = db.collection('user_info').document(current_user_uid).get()

    if not user_info_doc.exists:
        print(f"User with UID {current_user_uid} does not exist.")
        return []

    user_data = user_info_doc.to_dict()
    user_followers = user_data.get('following', [])
    followers_items_list = []

    for follower_id in user_followers:
        follower_doc = db.collection('user_info').document(follower_id).get()
        if follower_doc.exists:
            follower_owned_list = follower_doc.to_dict().get('owned_list', [])
            followers_items_list.extend(follower_owned_list)
        else:
            print(f"Follower with UID {follower_id} does not exist.")

    return followers_items_list


@app.route('/feed-items', methods=['GET'])
def get_feed_items():
    """
    Feed items are items from users that the current user follows.
    """
    current_user_uid = request.args.get('uid')

    if not current_user_uid:
        return jsonify([])  # Return an empty list if no user is logged in

    followers_items = helper_collate_followers_items(current_user_uid)

    # Fetch follower-owned items
    item_objects = []
    for item_id in followers_items:
        item = db.collection('card_items').document(item_id).get()
        if item.exists:
            item_data = item.to_dict()  # Convert Firestore document to a dictionary
            item_objects.append(item_data)

    return jsonify(item_objects)



@app.route('/explore-items', methods=['GET'])
def get_items():
    """
    Explore items are items from the card_items collection that exclude
    items owned by the current user or their followers.
    If no user is logged in, return all items.
    """
    current_user_uid = request.args.get('uid')

    # Reference to the "card_items" collection in Firestore
    card_items_ref = db.collection('card_items')

    # Query Firestore and get all items
    items = card_items_ref.stream()
    item_objects = [item.to_dict() for item in items]  # Convert Firestore documents to dictionaries

    # If no user is logged in, return all items
    if not current_user_uid:
        return jsonify(item_objects)

    # Fetch follower-owned items
    followers_items = helper_collate_followers_items(current_user_uid)
    follower_item_set = set(followers_items)

    # Filter out items owned by the current user or their followers
    filtered_items = [
        item for item in item_objects
        if item.get('owner_id') != current_user_uid and item.get('id') not in follower_item_set
    ]

    return jsonify(filtered_items)


if __name__ == '__main__':
    app.run(debug=True)
