// SQL data models mirroring schema/*

#[derive(Clone, serde::Serialize, Debug)]
pub struct Set {
    pub id: u32,
    pub name: String,
    pub uuid: String,
    pub last_revised: Option<String>,
    pub is_foreign: bool,
    pub description: Option<String>,
    pub question_count: u16,
}

#[derive(Clone, serde::Serialize, Debug)]
pub struct Question {
    pub id: u32,
    pub ser_question: String,
    pub ser_answer: String,
}
