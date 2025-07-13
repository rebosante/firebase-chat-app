<template>
  <div class="chat-container">
    <div class="user-box">
      User: <strong>{{ user?.email }}</strong>
    </div>
    <div class="checkpoints">
      <button @click="showCheckpoints = !showCheckpoints">📌</button>
      <div v-if="showCheckpoints" class="checkpoints-list">
        <div
          v-for="(checkpoint, index) in reactionCheckpoints"
          :key="index"
          class="checkpoint"
          @click="handleCheckpointClick(checkpoint.messageId)"
        >
          {{ checkpoint.emoji }} - {{ formatTime(checkpoint.timestamp) }}
        </div>
      </div>
    </div>
    <div ref="messagesContainer" class="messages">
      <div
        v-for="message in messages"
        :key="message.id"
        :id="'message-' + message.id"
        class="message"
        :class="{
          'my-message': message.user === user?.email,
          'other-message': message.user !== user?.email,
        }"
      >
        <p>
          <strong>{{ message.user }}:</strong> {{ message.text }}
        </p>
        <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
        <div class="reactions">
          <span
            v-for="emoji in emojiList"
            :key="emoji"
            class="emoji"
            :class="{
              selected: message.reactions?.[emoji]?.includes(user?.email),
            }"
            @click="toggleReaction(message.id, emoji)"
          >
            {{ emoji }}
            <span class="num-reaction">{{
              message.reactions?.[emoji]?.length || 0
            }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- message input -->
    <div class="input-area">
      <input
        v-model="newMessage"
        type="text"
        placeholder="Type a message..."
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">Send</button>
      <button @click="logout">Logout</button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from "vue";
import { useCollection } from "vuefire";
import { messagesCollection, auth } from "@/services/firebase";
import {
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  doc,
  collection,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "vue-router";

const checkpointsCollection = collection(
  messagesCollection.firestore,
  "checkpoints"
);
const emojiList = ["👍", "❤️", "😂", "🔥", "😢"];
const showCheckpoints = ref(false);

// Ref to firestore collection
const messages = useCollection(
  query(messagesCollection, orderBy("timestamp", "asc"))
);

const newMessage = ref("");
const user = ref(null);
const router = useRouter();
const messagesContainer = ref(null);
const messageRefs = ref({});
const reactionCheckpoints = ref([]);

onAuthStateChanged(auth, (loggedInUser) => {
  user.value = loggedInUser;
  if (loggedInUser) {
    loadCheckpoints();
  }
});

// Send mssg to Firestore
const sendMessage = async () => {
  if (!newMessage.value.trim() || !user.value) return;

  await addDoc(messagesCollection, {
    text: newMessage.value,
    user: user.value.email,
    timestamp: serverTimestamp(),
    reactions: {},
  });

  newMessage.value = "";
  scrollToBottom();
};

// Toggle reaction
const toggleReaction = async (messageId, emoji) => {
  const messageRef = doc(messagesCollection, messageId);
  const message = messages.value.find((m) => m.id === messageId);
  if (!message) return;

  const reactions = message.reactions || {};
  const userEmail = user.value.email;

  if (!reactions[emoji]) {
    reactions[emoji] = [];
  }

  if (reactions[emoji].includes(userEmail)) {
    // If reacted, remove reaction
    reactions[emoji] = reactions[emoji].filter((email) => email !== userEmail);
    if (reactions[emoji].length === 0) {
      delete reactions[emoji]; // Remove emoji if no users left
    }
  } else {
    // Add reaction
    reactions[emoji].push(userEmail);
    reactionCheckpoints.value.push({
      messageId,
      emoji,
      timestamp: message.timestamp,
    });
    await addDoc(checkpointsCollection, {
      messageId,
      emoji,
      timestamp: serverTimestamp(),
    });
  }

  await updateDoc(messageRef, { reactions });
};

// Scroll to message from checkpoint
const scrollToMessage = (messageId) => {
  nextTick(() => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const handleCheckpointClick = (messageId) => {
  scrollToMessage(messageId);
  showCheckpoints.value = false; // Oculta los checkpoints después del clic
};

const loadCheckpoints = async () => {
  const querySnapshot = await getDocs(checkpointsCollection);
  reactionCheckpoints.value = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Timestamp formatting
const formatTime = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date.toDate());
};

const logout = async () => {
  await signOut(auth);
  router.push("/");
};

watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true }
);
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 90vh;
  width: 100%;
  max-width: 400px;
  margin: auto;
  border: 1px solid #ccc;
  border-radius: 10px;
  position: relative;
  margin: 10px auto;
}

.user-box {
  color: #007bff;
  padding: 0.75rem;
}

.checkpoints {
  background: #fff3cd;
  padding: 0.35rem;
  border: 1px solid #ccc;
  border-radius: 0 10px 0 0;
  font-size: 10px;
  position: absolute;
  top: 0;
  right: 0;
  max-height: 60%;
}

@media screen and (min-width: 600px) {
  .checkpoints {
    top: 40px;
    left: 400px;
    width: max-content;
    border-radius: 0 10px 10px 0;
  }
}

.checkpoints button {
  background: #fff3cd;
  border: 1px solid #ccc;
  padding: 5px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.checkpoints button:hover {
  background: #f7d66d;
}

.checkpoints-list {
  background: #fff3cd;
  padding: 5px;
  border: 1px solid #ccc;
  font-size: 10px;
  overflow-y: auto;
  position: absolute;
  left: -1px;
  top: 40px;
  max-height: 200px;
  z-index: 10;
}

.checkpoint {
  cursor: pointer;
  margin: 5px 0;
  padding: 5px;
  background: #ffeeba;
  border-radius: 5px;
}

.checkpoint:hover {
  background: #ffd966;
}

.messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
}

.message {
  background: #fff;
  padding: 8px;
  margin-bottom: 5px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 85%;
}

.my-message {
  align-self: flex-end;
  background-color: #dcf8c6; /* Verde claro de WhatsApp */
}

.other-message {
  align-self: flex-start;
  background-color: #e5e5e5; /* Gris claro */
}

.timestamp {
  font-size: 0.7rem;
  color: gray;
}

.input-area {
  display: flex;
  padding: 10px;
  gap: 5px;
  background: white;
  border-top: 1px solid #ddd;
  flex-wrap: wrap;
}

input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
}

button {
  margin-left: 10px;
  padding: 10px 15px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

.reactions {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.emoji {
  cursor: pointer;
  font-size: 1.2rem;
  user-select: none;
  position: relative;
  margin-right: 0.5rem;
}

.emoji .num-reaction {
  font-size: 0.7rem;
  color: #555;
  position: absolute;
  bottom: -5px;
  left: 16px;
  width: 14px;
  height: 14px;
  text-align: center;
  background: #fff;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.selected {
  font-weight: bold;
  color: #ff9800;
}
</style>
